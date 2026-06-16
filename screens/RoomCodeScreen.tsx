import { Share } from "react-native"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import QRCode from "react-native-qrcode-svg"

type Props = NativeStackScreenProps<RootStackParamList, "RoomCode">

export default function RoomCodeScreen({ route, navigation }: Props) {
  const { roomCode, roomName, accessMode } = route.params

  const deepLink = `proximity://join/${roomCode}`

  const handleShare = () => {
    Share.share({ message: `join "${roomName}" on Proximity — code: ${roomCode}` })
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Pressable onPress={() => navigation.navigate("MainTabs")} style={styles.backButton}>
          <Text style={styles.backText}>← Done</Text>
        </Pressable>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.roomName} numberOfLines={2}>{roomName}</Text>
            <View style={[styles.badge, accessMode === "open" ? styles.badgeOpen : styles.badgePrivate]}>
              <Text style={[styles.badgeText, accessMode === "open" ? styles.badgeTextOpen : styles.badgeTextPrivate]}>
                {accessMode}
              </Text>
            </View>
          </View>

          <View style={styles.qrBox}>
            <QRCode value={deepLink} size={220} backgroundColor="#FFFFFF" color="#12101C" />
          </View>

          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{roomCode}</Text>
          </View>

          <Text style={styles.hint}>
            show this on a screen, print it, or text the code. anyone with the code can join, anyone with the QR can scan.
          </Text>
        </View>

        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>share code</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFB" },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: { alignSelf: "flex-start", paddingVertical: 12 },
  backText: { fontSize: 16, color: "#12101C", fontWeight: "500" },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  nameRow: {
    alignItems: "center",
    gap: 10,
  },
  roomName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#12101C",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgePrivate: {
    backgroundColor: "#F0EEF5",
  },
  badgeOpen: {
    backgroundColor: "#12101C",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  badgeTextPrivate: {
    color: "#4A4458",
  },
  badgeTextOpen: {
    color: "#FFFFFF",
  },
  qrBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 24,
    padding: 24,
  },
  codeRow: {
    alignItems: "center",
  },
  codeText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#12101C",
    letterSpacing: 10,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    color: "#A8A3B8",
    textAlign: "center",
    maxWidth: 280,
  },
  shareButton: {
    backgroundColor: "#12101C",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
})
