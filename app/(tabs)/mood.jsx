import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";

const MOODS = [
  {
    label: "Low",
    value: "1",
    color: "#6B7280",
    details: "Slower pace, heavy thoughts",
  },
  {
    label: "Uneasy",
    value: "2",
    color: "#8B7EC8",
    details: "Some tension, needs care",
  },
  {
    label: "Steady",
    value: "3",
    color: "#6B9FE4",
    details: "Balanced but watchful",
  },
  {
    label: "Good",
    value: "4",
    color: "#34D399",
    details: "Clearer focus and energy",
  },
  {
    label: "Strong",
    value: "5",
    color: "#F472B6",
    details: "Stable, bright, grounded",
  },
];

const WEEK_DATA = [
  { day: "M", value: 4 },
  { day: "T", value: 2 },
  { day: "W", value: 3 },
  { day: "T", value: 5 },
  { day: "F", value: 3 },
  { day: "S", value: 4 },
  { day: "S", value: null },
];

const INSIGHTS = [
  { value: "4.2", label: "Average mood" },
  { value: "7", label: "Day streak" },
  { value: "12", label: "Check-ins" },
];

const TAGS = [
  "Anxious",
  "Calm",
  "Tired",
  "Hopeful",
  "Overwhelmed",
  "Focused",
  "Grateful",
];

export default function Mood() {
  const selectedMood = MOODS[3];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>Mood tracking</Text>
        <Text style={styles.heading}>
          A clear snapshot of emotional check-ins
        </Text>
        <Text style={styles.subheading}>
          This screen stays visual only until you connect the mood logging
          backend.
        </Text>

        <View style={styles.currentCard}>
          <View>
            <Text style={styles.currentLabel}>Current state</Text>
            <Text style={styles.currentMood}>{selectedMood.label}</Text>
            <Text style={styles.currentDetails}>{selectedMood.details}</Text>
          </View>
          <View
            style={[styles.currentRing, { borderColor: selectedMood.color }]}
          >
            <Text
              style={[styles.currentRingValue, { color: selectedMood.color }]}
            >
              {selectedMood.value}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Mood range</Text>
        <View style={styles.moodGrid}>
          {MOODS.map((m) => (
            <View
              key={m.value}
              style={[
                styles.moodCard,
                m.value === selectedMood.value && {
                  borderColor: m.color,
                  backgroundColor: `${m.color}18`,
                },
              ]}
            >
              <Text style={styles.moodValue}>{m.value}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  m.value === selectedMood.value && { color: m.color },
                ]}
              >
                {m.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Weekly trend</Text>
        <View style={styles.weekChart}>
          {WEEK_DATA.map((day, idx) => (
            <View key={`${day.day}-${idx}`} style={styles.weekBarWrapper}>
              <View style={styles.weekBarTrack}>
                {day.value ? (
                  <View
                    style={[
                      styles.weekBar,
                      {
                        height: `${day.value * 20}%`,
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  />
                ) : null}
              </View>
              <Text style={styles.weekDay}>{day.day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsRow}>
          {INSIGHTS.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Common feelings</Text>
        <View style={styles.tagWrap}>
          {TAGS.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 36,
  },
  kicker: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heading: {
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
    fontSize: 29,
    lineHeight: 36,
    marginBottom: 8,
  },
  subheading: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  currentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  currentLabel: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  currentMood: {
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
    fontSize: 24,
    marginBottom: 4,
  },
  currentDetails: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 220,
  },
  currentRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceElevated,
  },
  currentRingValue: { fontFamily: theme.fonts.bodySemiBold, fontSize: 20 },
  sectionTitle: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 4,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: theme.spacing.lg,
  },
  moodCard: {
    flexGrow: 1,
    minWidth: "30%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  moodValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 16,
    marginBottom: 4,
  },
  moodLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  weekChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 112,
    marginBottom: theme.spacing.lg,
  },
  weekBarWrapper: { alignItems: "center", gap: 6, flex: 1 },
  weekBarTrack: {
    flex: 1,
    width: 22,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  weekBar: { borderRadius: 8, width: "100%" },
  weekDay: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: theme.spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontFamily: theme.fonts.display,
    color: theme.colors.primary,
    fontSize: 26,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagText: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
});
