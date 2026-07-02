import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { theme } from "../constants/theme";
import { BACKEND_URL } from "../constants/api";

export default function Chat() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "नमस्कार! हांव AshwaasAI. तुमी कसले उलोवपाक शकतात?",
      time: _now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // ── helpers ───────────────────────────────────────────────────────────────
  function _now() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function _addMessage(role, text) {
    setMessages((prev) => [...prev, { role, text, time: _now() }]);
  }

  async function _callBackend(body) {
    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Server error ${res.status}`);
    }
    return res.json();
  }

  // ── send text ──────────────────────────────────────────────────────────────
  async function handleSend() {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText("");
    _addMessage("user", text);
    setIsLoading(true);
    try {
      const data = await _callBackend({ text });
      _addMessage("assistant", data.assistant_konkani);
    } catch (e) {
      _addMessage("assistant", `⚠ ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // ── mic: tap to start, tap again to stop + send ───────────────────────────
  async function handleMic() {
    if (isRecording) {
      // Stop recording and send
      try {
        await audioRecorder.stop();
        const uri = audioRecorder.uri;
        setIsRecording(false);

        if (!uri) {
          throw new Error("Recording file was not created.");
        }

        _addMessage("user", "🎤 Voice message");
        setIsLoading(true);

        const audio_b64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const data = await _callBackend({ audio_b64 });
        // Replace the placeholder with actual transcription
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy.findLastIndex((m) => m.text === "🎤 Voice message");
          if (last !== -1)
            copy[last] = {
              ...copy[last],
              text: data.user_konkani || "🎤 Voice message",
            };
          return copy;
        });
        _addMessage("assistant", data.assistant_konkani);
      } catch (e) {
        _addMessage("assistant", `⚠ ${e.message}`);
        setIsRecording(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Start recording
      try {
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          _addMessage("assistant", "⚠ Microphone permission denied.");
          return;
        }
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
          interruptionMode: "doNotMix",
        });
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        setIsRecording(true);
      } catch (e) {
        _addMessage("assistant", `⚠ Could not start recording: ${e.message}`);
      }
    }
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>AshwaasAI</Text>
          </View>
        </View>

        {/* Message thread */}
        <ScrollView
          ref={scrollRef}
          style={styles.thread}
          contentContainerStyle={styles.threadContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((item, i) => {
            const isUser = item.role === "user";
            return (
              <View
                key={i}
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

          {/* Typing indicator */}
          {isLoading && (
            <View style={[styles.messageRow, styles.messageRowAssistant]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AI</Text>
              </View>
              <View style={[styles.bubble, styles.assistantBubble]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Composer */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 68}
        >
          <View style={styles.composerWrap}>
            <TouchableOpacity
              style={[styles.micPill, isRecording && styles.micPillActive]}
              activeOpacity={0.8}
              onPress={handleMic}
              disabled={isLoading}
            >
              <Text style={styles.micText}>{isRecording ? "⏹" : "🎤"}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.composerField}
              placeholder="Type in Konkani or use mic"
              placeholderTextColor={theme.colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              editable={!isLoading && !isRecording}
            />
            <TouchableOpacity
              style={[
                styles.sendPill,
                (!inputText.trim() || isLoading) && styles.sendPillDisabled,
              ]}
              activeOpacity={0.85}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
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
  messageRowAssistant: {},
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
  micPillActive: {
    backgroundColor: theme.colors.primaryGlow,
    borderColor: theme.colors.primary,
  },
  micText: { fontSize: 16 },
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
    fontFamily: theme.fonts.body,
  },
  sendPill: {
    width: 48,
    height: 44,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  sendPillDisabled: { backgroundColor: theme.colors.surfaceElevated },
  sendText: {
    color: "#fff",
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 18,
  },
});
