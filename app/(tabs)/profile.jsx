import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { BACKEND_URL, setBackendUrl } from "../../constants/api";

const settings = [
  {
    title: "Privacy & data",
    description: "Clear account handling and consent-first design.",
  },
  {
    title: "Voice input ready",
    description:
      "Reserved for speech-to-text integration when your service ships.",
  },
  {
    title: "Support resources",
    description: "Crisis and care links can be connected when you are ready.",
  },
];

export default function Profile() {
  const [backendInput, setBackendInput] = useState(BACKEND_URL);
  const [savedUrl, setSavedUrl] = useState(BACKEND_URL);

  function handleSaveBackendUrl() {
    const nextUrl = setBackendUrl(backendInput);
    setBackendInput(nextUrl);
    setSavedUrl(nextUrl);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>MH</Text>
          </View>
          <Text style={styles.profileName}>MindfulAI profile</Text>
          <Text style={styles.profileSub}>
            A lightweight account space for preferences, privacy, and support.
          </Text>
          <View style={styles.profileBadges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Private by design</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Voice ready</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Backend pending</Text>
            </View>
          </View>
        </View> */}

        <Text style={styles.sectionTitle}>Account overview</Text>
        <View style={styles.menuCard}>
          {settings.map((item, index) => (
            <View key={item.title}>
              <View style={styles.menuRow}>
                <View style={styles.menuDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </View>
              {index < settings.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Development backend</Text>
        <View style={styles.backendCard}>
          <Text style={styles.backendLabel}>Backend URL</Text>
          <Text style={styles.backendHint}>
            Temporary setting for development only. This changes where chat
            requests are sent.
          </Text>
          <TextInput
            value={backendInput}
            onChangeText={setBackendInput}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://your-ngrok-url.ngrok-free.dev"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.backendInput}
            returnKeyType="done"
            onSubmitEditing={handleSaveBackendUrl}
          />
          <View style={styles.backendActions}>
            <TouchableOpacity
              onPress={handleSaveBackendUrl}
              activeOpacity={0.85}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Save URL</Text>
            </TouchableOpacity>
            <Text style={styles.savedText} numberOfLines={1}>
              Active: {savedUrl}
            </Text>
          </View>
        </View>

        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Emergency support</Text>
          <Text style={styles.supportText}>
            Keep clear access to crisis resources and licensed care information
            in the finished product.
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          This app is a frontend preview. Do not rely on it for emergency or
          clinical use until your full backend and support flows are live.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(124,158,255,0.12)",
  },
  avatarLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 20,
    letterSpacing: 1,
  },
  profileName: {
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
    fontSize: 24,
    marginBottom: 4,
  },
  profileSub: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 19,
  },
  profileBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  badge: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeText: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  sectionTitle: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  menuDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  menuLabel: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.text,
    fontSize: 15,
    marginBottom: 3,
  },
  menuDescription: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  menuArrow: { color: theme.colors.textMuted, fontSize: 20 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginLeft: 42 },
  backendCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  backendLabel: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.text,
    fontSize: 15,
    marginBottom: 4,
  },
  backendHint: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  backendInput: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  backendActions: {
    marginTop: 12,
    gap: 10,
  },
  saveButton: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
  },
  savedText: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  supportCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  supportTitle: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.text,
    fontSize: 15,
    marginBottom: 6,
  },
  supportText: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  disclaimer: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
