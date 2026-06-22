import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../constants/theme";

const highlights = [
  {
    title: "Private conversations",
    description: "A calm interface for one-on-one mental health support.",
  },
  {
    title: "Voice ready",
    description:
      "Speech-to-text can be plugged in later without changing the UI.",
  },
  {
    title: "Mood-aware flow",
    description: "Simple check-in screens that keep the experience focused.",
  },
];

export default function Onboarding() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* simple background layer for minimal, consistent look */}

      <View style={styles.heroCard}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandText}>MindfulAI</Text>
        </View>
        <Text style={styles.title}>
          A calm, professional mental health assistant
        </Text>
        <Text style={styles.subtitle}>
          The frontend is ready for your custom AI and speech-to-text backend
          when those services go live.
        </Text>

        <View style={styles.ctaRow}>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={styles.primaryCta}
            activeOpacity={0.86}
          >
            <Text style={styles.primaryCtaText}>Enter app</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/chat")}
            style={styles.secondaryCta}
            activeOpacity={0.86}
          >
            <Text style={styles.secondaryCtaText}>View chat UI</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>What’s included</Text>
        {highlights.map((item) => (
          <View key={item.title} style={styles.highlightCard}>
            <Text style={styles.highlightTitle}>{item.title}</Text>
            <Text style={styles.highlightDescription}>{item.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 72,
    paddingBottom: 40,
    justifyContent: "center",
  },
  heroCard: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  brandBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primaryGlow,
    marginBottom: theme.spacing.lg,
  },
  brandText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: 34,
    color: theme.colors.text,
    lineHeight: 42,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 26,
    marginBottom: theme.spacing.lg,
  },
  ctaRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  primaryCta: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryCtaText: {
    color: "#fff",
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 15,
  },
  secondaryCta: {
    borderRadius: theme.radius.full,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  secondaryCtaText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 15,
  },
  section: { marginTop: theme.spacing.lg, gap: 10 },
  sectionLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  highlightCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  highlightTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 15,
    marginBottom: 4,
  },
  highlightDescription: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
});
