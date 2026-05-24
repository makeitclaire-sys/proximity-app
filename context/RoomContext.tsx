import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { useUser } from "./UserContext"
import {
  createRoom as svcCreate,
  joinRoom as svcJoin,
  leaveRoom as svcLeave,
  getCurrentRoom,
  getRoomMembers,
  type Room,
  type RoomMember,
} from "../services/roomService"

type RoomContextType = {
  room: Room | null
  roomLoaded: boolean
  members: RoomMember[]
  createRoom: (name: string) => Promise<void>
  joinRoom: (code: string) => Promise<void>
  leaveRoom: () => Promise<void>
  refreshRoom: () => Promise<void>
  refreshMembers: () => Promise<void>
}

const RoomContext = createContext<RoomContextType | null>(null)

export function RoomProvider({ children }: { children: ReactNode }) {
  const { profile } = useUser()
  const myId = profile.supabaseId

  const [room, setRoom] = useState<Room | null>(null)
  const [roomLoaded, setRoomLoaded] = useState(false)
  const [members, setMembers] = useState<RoomMember[]>([])

  const refreshRoom = useCallback(async () => {
    if (!myId) {
      setRoom(null)
      setRoomLoaded(true)
      return
    }
    try {
      const r = await getCurrentRoom(myId)
      setRoom(r)
    } catch {
      setRoom(null)
    } finally {
      setRoomLoaded(true)
    }
  }, [myId])

  const refreshMembers = useCallback(async () => {
    if (!room) { setMembers([]); return }
    try {
      setMembers(await getRoomMembers(room.id))
    } catch {
      setMembers([])
    }
  }, [room])

  useEffect(() => { refreshRoom() }, [refreshRoom])
  useEffect(() => { refreshMembers() }, [refreshMembers])

  const createRoom = async (name: string) => {
    if (!myId) throw new Error("Not signed in")
    const r = await svcCreate(name, myId)
    setRoom(r)
    setMembers(await getRoomMembers(r.id))
  }

  const joinRoom = async (code: string) => {
    if (!myId) throw new Error("Not signed in")
    const r = await svcJoin(code, myId)
    setRoom(r)
    setMembers(await getRoomMembers(r.id))
  }

  const leaveRoom = async () => {
    if (!myId || !room) return
    await svcLeave(room.id, myId)
    setRoom(null)
    setMembers([])
  }

  return (
    <RoomContext.Provider value={{ room, roomLoaded, members, createRoom, joinRoom, leaveRoom, refreshRoom, refreshMembers }}>
      {children}
    </RoomContext.Provider>
  )
}

export function useRoom() {
  const ctx = useContext(RoomContext)
  if (!ctx) throw new Error("useRoom must be used within RoomProvider")
  return ctx
}
