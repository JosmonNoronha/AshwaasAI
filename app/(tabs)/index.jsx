import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";

const conversations = [
  {
    id: "c1",
    title: "Session with MindfulAI",
    last: "Thanks — that helped me calm down",
    time: "Jun 21",
    unread: true,
  },
  {
    id: "c2",
    title: "Morning check-in",
    last: "Feeling a bit overwhelmed today",
    time: "Jun 20",
    unread: false,
  },
  {
    id: "c3",
    title: "Reflection: work stress",
    last: "I set a small boundary at work",
    time: "Jun 18",
    unread: false,
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
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
        <View style={{ gap: 10, marginBottom: theme.spacing.lg }}>
          {conversations.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => router.push(`/chat?id=${c.id}`)}
              activeOpacity={0.9}
              style={styles.convoCard}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>{c.title}</Text>
                <Text style={styles.infoBody} numberOfLines={1}>
                  {c.last}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", marginLeft: 12 }}>
                <Text style={styles.convoTime}>{c.time}</Text>
                {c.unread && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>●</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  kicker: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  name: {
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
    fontSize: 24,
    marginTop: 4,
  },
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
  avatarText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemiBold,
    letterSpacing: 1,
  },
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
  primaryButtonText: {
    color: "#fff",
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.full,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 8,
  },
  cardGrid: { gap: 10, marginBottom: theme.spacing.lg },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  convoTime: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  unreadBadge: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  unreadText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: theme.fonts.bodySemiBold,
  },
  infoTitle: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.text,
    fontSize: 15,
    marginBottom: 4,
  },
  infoBody: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  infoLink: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.primary,
    fontSize: 13,
  },
  noteCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepIndexText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 13,
  },
  stepText: {
    flex: 1,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
