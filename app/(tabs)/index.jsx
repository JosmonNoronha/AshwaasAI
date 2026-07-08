import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { authFetch } from "../../constants/api";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function Home() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorText, setErrorText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadConversations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setStatus("loading");
    }
    try {
      const data = await authFetch("/conversations");
      setConversations(data);
      setStatus("ready");
    } catch (e) {
      setErrorText(e.message || "Could not load conversations.");
      setStatus("error");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadConversations(true)}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>आशवास</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MH</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTag}>Conversations</Text>
          <Text style={styles.heroTitle}>Recent and ongoing conversations</Text>
          <Text style={styles.heroSub}>
            Tap to continue a conversation or start a new one.
          </Text>
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/chat?id=new")}
              activeOpacity={0.86}
            >
              <Text style={styles.primaryButtonText}>Start new</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>All conversations</Text>

        {status === "loading" && (
          <View style={styles.stateBox}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}

        {status === "error" && (
          <View style={styles.stateBox}>
            <Text style={styles.errorText}>⚠ {errorText}</Text>
          </View>
        )}

        {status === "ready" && conversations.length === 0 && (
          <View style={styles.stateBox}>
            <Text style={styles.emptyText}>
              No conversations yet. Tap "Start new" to begin.
            </Text>
          </View>
        )}

        {status === "ready" && conversations.length > 0 && (
          <View style={{ gap: 10, marginBottom: theme.spacing.lg }}>
            {conversations.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => router.push(`/chat?id=${c.id}`)}
                activeOpacity={0.9}
                style={styles.convoCard}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle} numberOfLines={1}>
                    {c.title || "New chat"}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", marginLeft: 12 }}>
                  <Text style={styles.convoTime}>{formatDate(c.updated_at)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  name: { fontFamily: theme.fonts.display, color: theme.colors.text, fontSize: 24, marginTop: 4 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, letterSpacing: 1 },
  heroCard: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(124,158,255,0.16)",
  },
  heroTag: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.primary,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
    fontSize: 25,
    lineHeight: 32,
    marginBottom: 8,
  },
  heroSub: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  heroButtons: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: { color: "#fff", fontFamily: theme.fonts.bodySemiBold, fontSize: 14 },
  sectionTitle: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 8,
  },
  convoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  convoTime: { fontFamily: theme.fonts.bodySemiBold, color: theme.colors.textSecondary, fontSize: 12 },
  infoTitle: { fontFamily: theme.fonts.bodySemiBold, color: theme.colors.text, fontSize: 15 },
  stateBox: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: theme.colors.danger,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    textAlign: "center",
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    textAlign: "center",
  },
});