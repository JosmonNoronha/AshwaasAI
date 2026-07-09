import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Keyboard,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { theme } from "../constants/theme";
import { authFetch } from "../constants/api";
import { loadLocalMessages, saveLocalMessages, upsertConversation } from "../constants/localChatStore";

let messageIdCounter = 0;
function nextMessageId() {
  messageIdCounter += 1;
  return `m-${Date.now()}-${messageIdCounter}`;
}

const GREETING = "नमस्कार! हांव AshwaasAI. तुमी कसले उलोवपाक शकतात?";

function _now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Chat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const { id } = useLocalSearchParams();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showKeyboardTip, setShowKeyboardTip] = useState(true);

  // Conversation bootstrap state
  const [conversationId, setConversationId] = useState(null);
  const [isConversationReady, setIsConversationReady] = useState(false);
  const [conversationError, setConversationError] = useState("");
  const didInitConversation = useRef(false);
  const conversationIdRef = useRef(null);

  const KEYBOARD_EXTRA_PADDING = 10;
  const composerOffset = useRef(new Animated.Value(insets.bottom)).current;

  // ── Bootstrap: create or load the conversation this screen is bound to ───
  useEffect(() => {
    if (didInitConversation.current) return;
    didInitConversation.current = true;

    async function init() {
      try {
        if (!id || id === "new") {
          const conv = await authFetch("/conversations", {
            method: "POST",
            body: JSON.stringify({}),
          });
          conversationIdRef.current = conv.id;
          setConversationId(conv.id);
          await upsertConversation({ id: conv.id, title: "New chat", updated_at: new Date().toISOString() });
          setMessages([
            { id: nextMessageId(), role: "assistant", text: GREETING, time: _now() },
          ]);
        } else {
          // Existing conversation: load the actual displayed history from
          // this device's local storage, not from the backend's session
          // memory (which only holds translated text for model context).
          conversationIdRef.current = id;
          setConversationId(id);

          const local = await loadLocalMessages(id);
          if (local && local.length > 0) {
            setMessages(local);
          } else {
            // Nothing stored locally for this conversation (new device,
            // reinstalled app, or cleared storage) — start fresh.
            setMessages([
              { id: nextMessageId(), role: "assistant", text: GREETING, time: _now() },
            ]);
          }
        }
      } catch (e) {
        setConversationError(e.message || "Could not load this conversation.");
      } finally {
        setIsConversationReady(true);
      }
    }

    init();
  }, [id]);

  // Persist the actual displayed conversation locally, on every change.
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      saveLocalMessages(conversationId, messages);
    }
  }, [messages, conversationId]);

  // Fire-and-forget /session/end when leaving this screen.
  useEffect(() => {
    return () => {
      const cid = conversationIdRef.current;
      if (!cid) return;
      authFetch("/session/end", {
        method: "POST",
        body: JSON.stringify({ conversation_id: cid }),
      }).catch(() => {});
    };
  }, []);

  // Scroll to bottom whenever messages change.
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = (e?.endCoordinates?.height ?? 0) + KEYBOARD_EXTRA_PADDING;
      const duration = Platform.OS === "ios" ? (e?.duration || 250) : 200;
      Animated.timing(composerOffset, {
        toValue: height,
        duration,
        useNativeDriver: false,
      }).start();
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    });
    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      const duration = Platform.OS === "ios" ? (e?.duration || 250) : 200;
      Animated.timing(composerOffset, {
        toValue: insets.bottom,
        duration,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom]);

  // ── helpers ───────────────────────────────────────────────────────────────
  function _addMessage(role, text) {
    const id = nextMessageId();
    setMessages((prev) => [...prev, { id, role, text, time: _now() }]);
    return id;
  }

  function _updateMessage(id, text) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text } : m)));
  }

  async function _callBackend(body) {
    return authFetch("/chat", {
      method: "POST",
      body: JSON.stringify({ ...body, conversation_id: conversationIdRef.current }),
    });
  }

  // ── send text ──────────────────────────────────────────────────────────────
  async function handleSend() {
    const text = inputText.trim();
    if (!text || isLoading || !isConversationReady || !conversationId) return;
    const isFirstMessage = messages.length <= 1; 
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
      await upsertConversation({
        id: conversationId,
        title: isFirstMessage ? text.slice(0, 60) : undefined,
        updated_at: new Date().toISOString(),
      });
    }
  }

  // ── mic: tap to start, tap again to stop + send ───────────────────────────
  async function handleMic() {
    if (!isConversationReady || !conversationId) return;

    if (isRecording) {
      let placeholderId = null;
      const isFirstMessage = messages.length <= 1; 
      try {
        await audioRecorder.stop();
        const uri = audioRecorder.uri;
        setIsRecording(false);

        if (!uri) {
          throw new Error("Recording file was not created.");
        }

        placeholderId = _addMessage("user", "🎤 Voice message");
        setIsLoading(true);

        const audio_b64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const data = await _callBackend({ audio_b64 });
        _updateMessage(placeholderId, data.user_konkani || "🎤 Voice message");
        _addMessage("assistant", data.assistant_konkani);

        await upsertConversation({
          id: conversationId,
          title: isFirstMessage && data.user_konkani ? data.user_konkani.slice(0, 60) : undefined,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        if (placeholderId) {
          _updateMessage(placeholderId, "⚠ Could not transcribe voice message");
        }
        _addMessage("assistant", `⚠ ${e.message}`);
        setIsRecording(false);
      } finally {
        setIsLoading(false);
      }
    } else {
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

  const inputDisabled = isLoading || isRecording || !isConversationReady || !conversationId;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>AshwaasAI</Text>
        </View>
      </View>

      <View style={styles.chatBody}>
        {!isConversationReady ? (
          <View style={styles.centerFill}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : conversationError ? (
          <View style={styles.centerFill}>
            <Text style={styles.errorText}>⚠ {conversationError}</Text>
          </View>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              style={styles.thread}
              contentContainerStyle={styles.threadContent}
              keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((item) => {
                const isUser = item.role === "user";
                return (
                  <View
                    key={item.id}
                    style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}
                  >
                    {!isUser && (
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>AI</Text>
                      </View>
                    )}
                    <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                      <Text style={[styles.bubbleText, isUser ? styles.userBubbleText : styles.assistantBubbleText]}>
                        {item.text}
                      </Text>
                      {!!item.time && (
                        <Text style={[styles.time, isUser && styles.timeUser]}>{item.time}</Text>
                      )}
                    </View>
                  </View>
                );
              })}

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

            <Animated.View style={{ marginBottom: composerOffset }}>
              {showKeyboardTip && (
                <View style={styles.keyboardTip}>
                  <View style={styles.keyboardTipHeader}>
                    <Text style={styles.keyboardTipLabel}>Input tip</Text>
                    <TouchableOpacity
                      onPress={() => setShowKeyboardTip(false)}
                      activeOpacity={0.8}
                      style={styles.keyboardTipClose}
                      accessibilityRole="button"
                      accessibilityLabel="Dismiss keyboard tip"
                    >
                      <Text style={styles.keyboardTipCloseText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.keyboardTipText}>
                    Use a Devanagari-capable keyboard like Gboard and switch to it
                    from your phone's keyboard selector.
                  </Text>
                </View>
              )}

              <View style={styles.composerWrap}>
                <TouchableOpacity
                  style={[styles.micPill, isRecording && styles.micPillActive]}
                  activeOpacity={0.8}
                  onPress={handleMic}
                  disabled={inputDisabled && !isRecording}
                  accessibilityRole="button"
                  accessibilityLabel={isRecording ? "Stop recording" : "Start recording"}
                >
                  <Text style={styles.micText}>{isRecording ? "⏹" : "🎤"}</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.composerField}
                  placeholder="कितेंय सांग.."
                  placeholderTextColor={theme.colors.textMuted}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSend}
                  editable={!inputDisabled}
                  multiline
                  maxLength={2000}
                />
                <TouchableOpacity
                  style={[styles.sendPill, (!inputText.trim() || inputDisabled) && styles.sendPillDisabled]}
                  activeOpacity={0.85}
                  onPress={handleSend}
                  disabled={!inputText.trim() || inputDisabled}
                  accessibilityRole="button"
                  accessibilityLabel="Send message"
                >
                  <Text style={styles.sendText}>→</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  chatBody: { flex: 1, paddingHorizontal: theme.spacing.lg },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: {
    color: theme.colors.danger,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
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
  backText: { color: theme.colors.primary, fontSize: 20, fontFamily: theme.fonts.bodySemiBold },
  headerCopy: { flex: 1, paddingHorizontal: 12 },
  title: { fontFamily: theme.fonts.bodySemiBold, color: theme.colors.text, fontSize: 18 },
  thread: { flex: 1 },
  threadContent: { paddingBottom: 12, flexGrow: 1 },
  messageRow: { flexDirection: "row", gap: 10, alignItems: "flex-end", marginBottom: 12 },
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
  avatarText: { color: theme.colors.primary, fontFamily: theme.fonts.bodySemiBold, fontSize: 11 },
  bubble: { maxWidth: "78%", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 12 },
  assistantBubble: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  userBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  assistantBubbleText: { color: theme.colors.text, fontFamily: theme.fonts.body },
  userBubbleText: { color: "#fff", fontFamily: theme.fonts.body },
  time: { marginTop: 6, fontSize: 10, color: theme.colors.textMuted, fontFamily: theme.fonts.body },
  timeUser: { color: "rgba(255,255,255,0.72)" },
  composerWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  keyboardTip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  keyboardTipHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  keyboardTipLabel: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  keyboardTipClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  keyboardTipCloseText: { color: theme.colors.textSecondary, fontSize: 18, lineHeight: 18, marginTop: -1 },
  keyboardTipText: { color: theme.colors.textSecondary, fontFamily: theme.fonts.body, fontSize: 13, lineHeight: 19 },
  micPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  micPillActive: { backgroundColor: theme.colors.primaryGlow, borderColor: theme.colors.primary },
  micText: { fontSize: 16 },
  composerField: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.xl,
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
  sendText: { color: "#fff", fontFamily: theme.fonts.bodySemiBold, fontSize: 18 },
});