import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { SafeAreaView } from "react-native-safe-area-context"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { useUser } from "../context/UserContext"
import { updateProfile as saveToSupabase, uploadAvatar } from "../services/profileService"

type Props = NativeStackScreenProps<RootStackParamList, "EditProfile">

export default function EditProfileScreen({ navigation }: Props) {
  const { profile, profileLoaded, updateProfile, refreshProfile } = useUser()

  // Form fields — initialized empty; synced from profile once profileLoaded is true
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [interestsText, setInterestsText] = useState("")
  const [talkText, setTalkText] = useState("")
  const [avoidText, setAvoidText] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Populate form once the real profile has been fetched from Supabase
  useEffect(() => {
    if (!profileLoaded) return
    setName(profile.name)
    setBio(profile.bio)
    setAvatarUrl(profile.avatarUrl ?? "")
    setInterestsText(profile.interests.join("\n"))
    setTalkText(profile.talkTopics.join("\n"))
    setAvoidText(profile.avoidTopics.join("\n"))
  }, [profileLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  const initials = name.trim()
    ? name.trim().split(" ").map(p => p[0]).join("")
    : "?"

  const pickAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to your photos to set a profile picture.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (result.canceled) return

    const asset = result.assets[0]

    if (profile.supabaseId == null) {
      setAvatarUrl(asset.uri)
      updateProfile({ avatarUrl: asset.uri })
      return
    }

    setUploading(true)
    try {
      const publicUrl = await uploadAvatar(profile.supabaseId, asset.uri)
      setAvatarUrl(publicUrl)
      updateProfile({ avatarUrl: publicUrl })
      await saveToSupabase(profile.supabaseId, { avatar_url: publicUrl })
    } catch (err) {
      console.error("UPLOAD ERROR:", err)
      Alert.alert("Upload failed", "Could not upload your photo. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    const trimmedName = name.trim() || profile.name
    const interests = interestsText.split("\n").map(s => s.trim()).filter(Boolean)
    const talkTopics = talkText.split("\n").map(s => s.trim()).filter(Boolean)
    const avoidTopics = avoidText.split("\n").map(s => s.trim()).filter(Boolean)
    const trimmedAvatarUrl = avatarUrl.trim() || null

    updateProfile({ name: trimmedName, bio: bio.trim(), interests, talkTopics, avoidTopics, avatarUrl: trimmedAvatarUrl })

    if (profile.supabaseId != null) {
      setSaving(true)
      try {
        await saveToSupabase(profile.supabaseId, {
          name: trimmedName,
          bio: bio.trim(),
          interests,
          talk_topics: talkTopics,
          avoid_topics: avoidTopics,
          avatar_url: trimmedAvatarUrl,
        })
        // Re-fetch so MyProfileScreen reflects the confirmed saved data
        await refreshProfile()
      } catch (err) {
        console.error("SAVE ERROR:", err)
        Alert.alert("Error", "Could not save to Supabase. Changes saved locally only.")
        setSaving(false)
        return
      }
      setSaving(false)
    }

    navigation.goBack()
  }

  if (!profileLoaded) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <ActivityIndicator size="small" color="#12101C" style={styles.loader} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.screenTitle}>Edit Profile</Text>

            {/* Photo picker */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>PHOTO</Text>
              <View style={styles.photoRow}>
                <View style={styles.avatarPreview}>
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatarPreviewImage} />
                  ) : (
                    <Text style={styles.avatarPreviewInitials}>{initials}</Text>
                  )}
                </View>
                <View style={styles.photoActions}>
                  <Pressable
                    style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                    onPress={pickAndUpload}
                    disabled={uploading}
                  >
                    <Text style={styles.uploadButtonText}>
                      {uploading ? "Uploading…" : avatarUrl ? "Change Photo" : "Upload Photo"}
                    </Text>
                  </Pressable>
                  {avatarUrl ? (
                    <Pressable style={styles.removeButton} onPress={() => setAvatarUrl("")}>
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NAME</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#A8A3B8"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>BIO</Text>
              <TextInput
                style={styles.textAreaInput}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell people about yourself"
                placeholderTextColor="#A8A3B8"
                multiline
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>INTERESTS</Text>
              <Text style={styles.fieldHint}>One per line</Text>
              <TextInput
                style={styles.textAreaInput}
                value={interestsText}
                onChangeText={setInterestsText}
                placeholder={"Design\nBouldering\nFood"}
                placeholderTextColor="#A8A3B8"
                multiline
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>TALK TO ME ABOUT</Text>
              <Text style={styles.fieldHint}>One per line</Text>
              <TextInput
                style={styles.textAreaInput}
                value={talkText}
                onChangeText={setTalkText}
                placeholder={"Finding good coffee in new places\nSide projects that went somewhere\nWhat you're currently obsessing over"}
                placeholderTextColor="#A8A3B8"
                multiline
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{"DON'T TALK TO ME ABOUT"}</Text>
              <Text style={styles.fieldHint}>One per line</Text>
              <TextInput
                style={styles.textAreaInput}
                value={avoidText}
                onChangeText={setAvoidText}
                placeholder={"Crypto pitches\nLinkedIn hustle culture\nNetworking for its own sake"}
                placeholderTextColor="#A8A3B8"
                multiline
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.saveButton, (saving || uploading) && styles.saveButtonDisabled]}
              onPress={save}
              disabled={saving || uploading}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Saving…" : "Save changes"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFB",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 12,
  },
  backText: {
    fontSize: 16,
    color: "#12101C",
    fontWeight: "500",
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 24,
    gap: 24,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#12101C",
    lineHeight: 34,
  },

  // Photo picker
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarPreview: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    backgroundColor: "#EEEBF2",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarPreviewImage: {
    width: 72,
    height: 72,
  },
  avatarPreviewInitials: {
    fontSize: 24,
    fontWeight: "700",
    color: "#A8A3B8",
  },
  photoActions: {
    flex: 1,
    gap: 8,
  },
  uploadButton: {
    backgroundColor: "#12101C",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: "center",
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  removeButton: {
    alignItems: "center",
    paddingVertical: 4,
  },
  removeButtonText: {
    fontSize: 13,
    color: "#A8A3B8",
    fontWeight: "500",
  },

  // Fields
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#12101C",
    letterSpacing: 1,
  },
  fieldHint: {
    fontSize: 12,
    color: "#A8A3B8",
    marginTop: -4,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: "#12101C",
  },
  textAreaInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#12101C",
    minHeight: 100,
    textAlignVertical: "top",
  },

  // Footer
  footer: {
    paddingTop: 10,
  },
  saveButton: {
    backgroundColor: "#12101C",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
})
