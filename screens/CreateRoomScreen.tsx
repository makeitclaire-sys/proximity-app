import { useState } from "react"
import {
  View, Text, Pressable, TextInput, StyleSheet,
  KeyboardAvoidingView, TouchableWithoutFeedback,
  Keyboard, ActivityIndicator, Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { useRoom } from "../context/RoomContext"
import { getCurrentCoarseLocation } from "../lib/location"

type Props = NativeStackScreenProps<RootStackParamList, "CreateRoom">

export default function CreateRoomScreen({ navigation }: Props) {
  const { createRoom } = useRoom()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [accessMode, setAccessMode] = useState<"private" | "open">("private")
  const [locationDenied, setLocationDenied] = useState(false)
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number } | null>(null)

  const handleModeSelect = async (mode: "private" | "open") => {
    setLocationDenied(false)
    if (mode === "private") {
      setAccessMode("private")
      setPendingCoords(null)
      return
    }
    const coords = await getCurrentCoarseLocation()
    if (!coords) {
      setLocationDenied(true)
      return
    }
    setAccessMode("open")
    setPendingCoords(coords)
  }

  const handleCreate = async () => {
    if (!name.trim() || loading) return
    Keyboard.dismiss()
    setLoading(true)
    try {
      const room = await createRoom(name.trim(), {
        accessMode,
        latitude: pendingCoords?.lat ?? null,
        longitude: pendingCoords?.lng ?? null,
      })
      navigation.replace("RoomCode", {
        roomCode: room.code,
        roomName: room.name,
        accessMode: room.accessMode,
      })
    } catch (err) {
      Alert.alert("couldn't create room", err instanceof Error ? err.message : "please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.content}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <View style={styles.body}>
              <Text style={styles.title}>Create a room</Text>
              <Text style={styles.subtitle}>
                Give your room a name — your table, your event, your space.
              </Text>

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Design breakfast, Table 4"
                placeholderTextColor="#A8A3B8"
                autoFocus
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleCreate}
                maxLength={60}
                editable={!loading}
              />

              {/* Access mode segmented control */}
              <View style={styles.segmented}>
                <Pressable
                  style={[styles.segment, accessMode === "private" && styles.segmentActive]}
                  onPress={() => handleModeSelect("private")}
                >
                  <Text style={[styles.segmentText, accessMode === "private" && styles.segmentTextActive]}>
                    private
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.segment, accessMode === "open" && styles.segmentActive]}
                  onPress={() => handleModeSelect("open")}
                >
                  <Text style={[styles.segmentText, accessMode === "open" && styles.segmentTextActive]}>
                    open
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.modeExplainer}>
                {accessMode === "private"
                  ? "only people with the code can join."
                  : "people within 200m can see this room and join with one tap."}
              </Text>

              {locationDenied && (
                <Text style={styles.locationDenied}>
                  we need location permission to make this room open
                </Text>
              )}
            </View>

            <View style={styles.footer}>
              <Pressable
                style={[styles.primaryButton, (!name.trim() || loading) && styles.disabled]}
                onPress={handleCreate}
                disabled={!name.trim() || loading}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.primaryButtonText}>Create room</Text>
                }
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: "#FAFAFB" },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
    justifyContent: "space-between",
  },
  backButton: { alignSelf: "flex-start", paddingVertical: 12 },
  backText: { fontSize: 16, color: "#12101C", fontWeight: "500" },
  body: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#12101C",
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4A4458",
    maxWidth: 300,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    fontSize: 17,
    color: "#12101C",
    marginTop: 8,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: "#F0EEF5",
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: "#12101C",
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A4458",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  modeExplainer: {
    fontSize: 13,
    lineHeight: 18,
    color: "#4A4458",
    marginTop: -4,
  },
  locationDenied: {
    fontSize: 12,
    color: "#FF2D87",
    marginTop: -4,
  },
  footer: { gap: 12 },
  primaryButton: {
    backgroundColor: "#12101C",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  disabled: { opacity: 0.45 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
})
