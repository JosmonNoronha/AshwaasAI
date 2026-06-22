import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../constants/theme";

const conversation = [
  {
    role: "assistant",
    time: "10:00 AM",
    text: "Welcome to MindfulAI. Start a conversation or continue where you left off.",
  },
  { role: "user", time: "10:01 AM", text: "I want a calm place to reflect." },
  {
    role: "assistant",
    time: "10:02 AM",
    text: "I hear you. Small steps are fine.",
  },
];

export default function Chat() {
  const router = useRouter();
  const [convoId, setConvoId] = useState("new");

  useEffect(() => {
    // safe parse of `id` query param (works on web); fall back to 'new'
    try {
      if (
        typeof window !== "undefined" &&
        window.location &&
        window.location.search
      ) {
        const sp = new URLSearchParams(window.location.search);
        const id = sp.get("id");
        if (id) setConvoId(id);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>
              {convoId === "new" ? "New conversation" : "Conversation"}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.thread}
          contentContainerStyle={styles.threadContent}
          showsVerticalScrollIndicator={false}
        >
          {conversation.map((item, i) => {
            const isUser = item.role === "user";
            return (
              <View
                key={`${item.role}-${i}`}
                style={[
                  styles.messageRow,
                  isUser ? styles.messageRowUser : styles.messageRowAssistant,
                ]}
              >
                {!isUser && (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>AI</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      isUser
                        ? styles.userBubbleText
                        : styles.assistantBubbleText,
                    ]}
                  >
                    {item.text}
                  </Text>
                  <Text style={[styles.time, isUser && styles.timeUser]}>
                    {item.time}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 68}
        >
          <View style={styles.composerWrap}>
            <TouchableOpacity style={styles.micPill} activeOpacity={0.8}>
              <Text style={styles.micText}>🎤</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.composerField}
              placeholder="Type a message"
              placeholderTextColor={theme.colors.textMuted}
            />
            <TouchableOpacity style={styles.sendPill} activeOpacity={0.85}>
              <Text style={styles.sendText}>→</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: theme.colors.primary,
    fontSize: 20,
    fontFamily: theme.fonts.bodySemiBold,
  },
  headerCopy: { flex: 1, paddingHorizontal: 12 },
  title: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.text,
    fontSize: 18,
  },

  thread: { flex: 1, marginBottom: 8 },
  threadContent: { paddingBottom: 16 },
  messageRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
    marginBottom: 12,
  },
  messageRowUser: { flexDirection: "row-reverse" },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 11,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  assistantBubble: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  assistantBubbleText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  userBubbleText: { color: "#fff", fontFamily: theme.fonts.body },
  time: {
    marginTop: 6,
    fontSize: 10,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
  },
  timeUser: { color: "rgba(255,255,255,0.72)" },

  composerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  micPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  micText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 16,
  },
  composerField: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  },
  sendPill: {
    width: 48,
    height: 44,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  sendText: {
    color: "#fff",
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 18,
  },
});
