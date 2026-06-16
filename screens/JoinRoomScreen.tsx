import { useState, useEffect } from "react"
import {
  View, Text, Pressable, TextInput, StyleSheet,
  KeyboardAvoidingView, TouchableWithoutFeedback,
  Keyboard, ActivityIndicator, Alert, ScrollView, Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { useRoom } from "../context/RoomContext"
import { getCurrentCoarseLocation } from "../lib/location"
import { getNearbyOpenRooms, type NearbyRoom } from "../services/roomService"
import { CameraView, useCameraPermissions } from "expo-camera"

type Props = NativeStackScreenProps<RootStackParamList, "JoinRoom">

export default function JoinRoomScreen({ navigation }: Props) {
  const { joinRoom } = useRoom()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [nearbyRooms, setNearbyRooms] = useState<NearbyRoom[]>([])
  const [nearbyLoading, setNearbyLoading] = useState(true)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [scannerVisible, setScannerVisible] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const coords = await getCurrentCoarseLocation()
      if (cancelled || !coords) { setNearbyLoading(false); return }
      try {
        const rooms = await getNearbyOpenRooms(coords.lat, coords.lng)
        if (!cancelled) setNearbyRooms(rooms)
      } catch {
        // silently hide section on error
      } finally {
        if (!cancelled) setNearbyLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleCode = (text: string) => {
    setCode(text.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))
  }

  const handleJoin = async (codeToJoin = code) => {
    if (codeToJoin.length !== 6 || loading) return
    Keyboard.dismiss()
    setLoading(true)
    try {
      await joinRoom(codeToJoin)
      navigation.goBack()
    } catch (err) {
      Alert.alert("couldn't join room", err instanceof Error ? err.message : "check the code and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinNearby = async (room: NearbyRoom) => {
    if (joiningId) return
    setJoiningId(room.id)
    try {
      await joinRoom(room.code)
      navigation.goBack()
    } catch (err) {
      Alert.alert("couldn't join room", err instanceof Error ? err.message : "please try again.")
    } finally {
      setJoiningId(null)
    }
  }

  const handleOpenScanner = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission()
      if (!result.granted) {
        Alert.alert("camera needed", "allow camera access to scan a QR code.")
        return
      }
    }
    setScanned(false)
    setScannerVisible(true)
  }

  const handleBarcodeScan = ({ data }: { data: string }) => {
    if (scanned) return
    setScanned(true)
    setScannerVisible(false)
    // proximity://join/ABCDEF
    const match = data.match(/proximity:\/\/join\/([A-Z0-9]{6})/i)
    if (match) {
      handleJoin(match[1].toUpperCase())
    } else {
      Alert.alert("invalid QR", "that doesn't look like a Proximity room code.")
    }
  }

  const showNearby = !nearbyLoading && nearbyRooms.length > 0

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            {showNearby && (
              <View style={styles.nearbySection}>
                <Text style={styles.nearbyHeading}>open rooms nearby</Text>
                {nearbyRooms.map(room => (
                  <Pressable
                    key={room.id}
                    style={styles.nearbyCard}
                    onPress={() => handleJoinNearby(room)}
                    disabled={!!joiningId}
                  >
                    <View style={styles.nearbyCardInfo}>
                      <Text style={styles.nearbyRoomName}>{room.name}</Text>
                      <Text style={styles.nearbyMeta}>
                        {room.memberCount} {room.memberCount === 1 ? "person" : "people"} here · {room.distanceMeters}m away
                      </Text>
                    </View>
                    {joiningId === room.id
                      ? <ActivityIndicator color="#12101C" />
                      : <Text style={styles.nearbyJoin}>join →</Text>
                    }
                  </Pressable>
                ))}
              </View>
            )}

            <View style={styles.codeSection}>
              <Text style={styles.title}>Join a room</Text>
              <Text style={styles.subtitle}>
                Enter the 6-character code from the host, or scan the QR.
              </Text>

              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.codeInput, { flex: 1 }]}
                  value={code}
                  onChangeText={handleCode}
                  placeholder="XXXXXX"
                  placeholderTextColor="#C4BFD4"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => handleJoin()}
                  maxLength={6}
                  editable={!loading}
                />
                <Pressable style={styles.scanButton} onPress={handleOpenScanner}>
                  <Text style={styles.scanButtonText}>scan QR</Text>
                </Pressable>
              </View>

              {code.length > 0 && code.length < 6 && (
                <Text style={styles.hint}>{6 - code.length} characters remaining</Text>
              )}

              <Pressable
                style={[styles.primaryButton, (code.length !== 6 || loading) && styles.disabled]}
                onPress={() => handleJoin()}
                disabled={code.length !== 6 || loading}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.primaryButtonText}>Join room</Text>
                }
              </Pressable>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* QR scanner modal */}
      <Modal visible={scannerVisible} presentationStyle="fullScreen" animationType="slide">
        <SafeAreaView style={styles.scannerContainer} edges={["top", "bottom"]}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={!scanned ? handleBarcodeScan : undefined}
          />
          <View style={styles.scannerOverlay}>
            <Text style={styles.scannerLabel}>point at the room QR code</Text>
          </View>
          <Pressable style={styles.scannerCancel} onPress={() => setScannerVisible(false)}>
            <Text style={styles.scannerCancelText}>cancel</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: "#FAFAFB" },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backButton: { alignSelf: "flex-start", paddingVertical: 12 },
  backText: { fontSize: 16, color: "#12101C", fontWeight: "500" },
  nearbySection: { marginBottom: 32, gap: 12 },
  nearbyHeading: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#A8A3B8",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  nearbyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nearbyCardInfo: { flex: 1, gap: 3 },
  nearbyRoomName: { fontSize: 16, fontWeight: "700", color: "#12101C" },
  nearbyMeta: { fontSize: 13, color: "#4A4458" },
  nearbyJoin: { fontSize: 14, fontWeight: "600", color: "#12101C", marginLeft: 12 },
  codeSection: { gap: 16 },
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
  inputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 8,
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
  },
  scanButton: {
    backgroundColor: "#F0EEF5",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#12101C",
  },
  hint: {
    fontSize: 12,
    color: "#A8A3B8",
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#12101C",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 4,
  },
  disabled: { opacity: 0.45 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  // Scanner
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  scannerOverlay: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scannerLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  scannerCancel: {
    position: "absolute",
    bottom: 48,
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
  },
  scannerCancelText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
})
