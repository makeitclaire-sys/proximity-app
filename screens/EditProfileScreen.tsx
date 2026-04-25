import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { useUser } from "../context/UserContext"

type Props = NativeStackScreenProps<RootStackParamList, "EditProfile">

export default function EditProfileScreen({ navigation }: Props) {
  const { profile, updateProfile } = useUser()

  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [interestsText, setInterestsText] = useState(profile.interests.join("\n"))
  const [talkText, setTalkText] = useState(profile.talkTopics.join("\n"))
  const [avoidText, setAvoidText] = useState(profile.avoidTopics.join("\n"))

  const save = () => {
    updateProfile({
      name: name.trim() || profile.name,
      bio: bio.trim(),
      interests: interestsText.split("\n").map(s => s.trim()).filter(Boolean),
      talkTopics: talkText.split("\n").map(s => s.trim()).filter(Boolean),
      avoidTopics: avoidText.split("\n").map(s => s.trim()).filter(Boolean),
    })
    navigation.goBack()
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
            <Pressable style={styles.saveButton} onPress={save}>
              <Text style={styles.saveButtonText}>Save changes</Text>
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
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
})
