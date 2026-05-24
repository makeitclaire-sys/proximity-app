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

type Props = NativeStackScreenProps<RootStackParamList, "CreateRoom">

export default function CreateRoomScreen({ navigation }: Props) {
  const { createRoom } = useRoom()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [roomCode, setRoomCode] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim() || loading) return
    Keyboard.dismiss()
    setLoading(true)
    try {
      await createRoom(name.trim())
      // Pull the code from context after creation
      // createRoom sets room in context; we read it via the returned value indirectly.
      // Re-read from context is handled below by checking useRoom().room — but we need
      // the code immediately here. createRoom() in the service returns the room, but
      // RoomContext wraps it. We'll get it from context on next render cycle.
      // Simpler: just navigate back — Discover will reflect the room state.
      navigation.goBack()
    } catch (err) {
      Alert.alert("Couldn't create room", err instanceof Error ? err.message : "Please try again.")
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
