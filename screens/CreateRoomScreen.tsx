import { useState } from "react"
import {
  View, Text, Pressable, TextInput, StyleSheet, Switch,
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
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [discoverable, setDiscoverable] = useState(false)
  const [locationDenied, setLocationDenied] = useState(false)
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number } | null>(null)

  const handleDiscoverableToggle = async (value: boolean) => {
    setLocationDenied(false)
    if (!value) {
      setDiscoverable(false)
      setPendingCoords(null)
      return
    }
    const coords = await getCurrentCoarseLocation()
    if (!coords) {
      setLocationDenied(true)
      return
    }
    setDiscoverable(true)
    setPendingCoords(coords)
  }

  const handleCreate = async () => {
    if (!name.trim() || loading) return
    Keyboard.dismiss()
    setLoading(true)
    try {
      const room = await createRoom(name.trim(), {
        isDiscoverable: discoverable,
        latitude: pendingCoords?.lat ?? null,
        longitude: pendingCoords?.lng ?? null,
      })
      setRoomCode(room.code)
    } catch (err) {
      Alert.alert("Couldn't create room", err instanceof Error ? err.message : "Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (roomCode) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <View style={styles.body}>
            <Text style={styles.title}>Room created</Text>
            <Text style={styles.subtitle}>
              Share this code so others can join your room.
            </Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{roomCode}</Text>
            </View>
            {discoverable && (
              <Text style={styles.discoverableNote}>
                this room is discoverable — people within ~200m can see it.
              </Text>
            )}
          </View>
          <View style={styles.footer}>
            <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.primaryButtonText}>Go to room</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    )
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

              <View style={styles.toggleRow}>
                <View style={styles.toggleLabel}>
                  <Text style={styles.toggleTitle}>make this room discoverable</Text>
                  <Text style={styles.toggleDescription}>
                    people within about 200 meters can see and join. private rooms still need a code.
                  </Text>
                  {locationDenied && (
                    <Text style={styles.locationDenied}>
                      we need location permission to make this room discoverable
                    </Text>
                  )}
                </View>
                <Switch
                  value={discoverable}
                  onValueChange={handleDiscoverableToggle}
                  trackColor={{ false: "#EEEBF2", true: "#12101C" }}
                  thumbColor="#FFFFFF"
                  disabled={loading}
                />
              </View>
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
  toggleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  toggleLabel: { flex: 1, gap: 4 },
  toggleTitle: { fontSize: 15, fontWeight: "600", color: "#12101C" },
  toggleDescription: { fontSize: 13, lineHeight: 18, color: "#4A4458" },
  locationDenied: { fontSize: 12, color: "#FF2D87", marginTop: 4 },
  discoverableNote: {
    fontSize: 13,
    color: "#4A4458",
    textAlign: "center",
    marginTop: 8,
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
  codeBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 18,
    paddingVertical: 24,
    alignItems: "center",
    marginTop: 8,
  },
  codeText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#12101C",
    letterSpacing: 8,
  },
})
