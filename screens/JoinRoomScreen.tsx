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

type Props = NativeStackScreenProps<RootStackParamList, "JoinRoom">

export default function JoinRoomScreen({ navigation }: Props) {
  const { joinRoom } = useRoom()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCode = (text: string) => {
    setCode(text.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))
  }

  const handleJoin = async () => {
    if (code.length !== 6 || loading) return
    Keyboard.dismiss()
    setLoading(true)
    try {
      await joinRoom(code)
      navigation.goBack()
    } catch (err) {
      Alert.alert("Couldn't join room", err instanceof Error ? err.message : "Check the code and try again.")
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
              <Text style={styles.title}>Join a room</Text>
              <Text style={styles.subtitle}>
                Enter the 6-character code from the person who created the room.
              </Text>

              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={handleCode}
                placeholder="XXXXXX"
                placeholderTextColor="#C4BFD4"
                autoFocus
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleJoin}
                maxLength={6}
                editable={!loading}
              />

              {code.length > 0 && code.length < 6 && (
                <Text style={styles.hint}>{6 - code.length} characters remaining</Text>
              )}
            </View>

            <View style={styles.footer}>
              <Pressable
                style={[styles.primaryButton, (code.length !== 6 || loading) && styles.disabled]}
                onPress={handleJoin}
                disabled={code.length !== 6 || loading}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.primaryButtonText}>Join room</Text>
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
  codeInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 20,
    fontSize: 28,
    fontWeight: "700",
    color: "#12101C",
    letterSpacing: 6,
    textAlign: "center",
    marginTop: 8,
  },
  hint: {
    fontSize: 12,
    color: "#A8A3B8",
    textAlign: "center",
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
