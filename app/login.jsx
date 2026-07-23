import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../constants/theme";
import { supabase } from "../constants/supabase";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [infoText, setInfoText] = useState("");

  function resetMessages() {
    setErrorText("");
    setInfoText("");
  }

  function switchMode(nextMode) {
    resetMessages();
    setMode(nextMode);
  }

  async function handleLogin() {
    resetMessages();
    if (!email.trim() || !password) {
      setErrorText("Enter your email and password.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setErrorText(error.message);
        return;
      }
      router.replace("/(tabs)");
    } catch (e) {
      setErrorText(e.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignup() {
    resetMessages();
    if (!email.trim() || !password) {
      setErrorText("Enter your email and password.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) {
        setErrorText(error.message);
        return;
      }
      if (data.session) {
        // Email confirmation is OFF — session comes back immediately.
        router.replace("/(tabs)");
      } else {
        // Email confirmation is ON — no session yet.
        setInfoText("Check your email to confirm your account, then log in.");
        setMode("login");
        setPassword("");
      }
    } catch (e) {
      setErrorText(e.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit() {
    if (isLoading) return;
    mode === "login" ? handleLogin() : handleSignup();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.brand}>आशवास</Text>
          <Text style={styles.title}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </Text>
          <Text style={styles.subtitle}>
            {mode === "login"
              ? "Log in to continue your conversations."
              : "Sign up to start talking with AshwaasAI."}
          </Text>

          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, mode === "login" && styles.modeButtonActive]}
              onPress={() => switchMode("login")}
              activeOpacity={0.85}
            >
              <Text style={[styles.modeButtonText, mode === "login" && styles.modeButtonTextActive]}>
                Log in
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === "signup" && styles.modeButtonActive]}
              onPress={() => switchMode("signup")}
              activeOpacity={0.85}
            >
              <Text style={[styles.modeButtonText, mode === "signup" && styles.modeButtonTextActive]}>
                Sign up
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              onSubmitEditing={handleSubmit}
              returnKeyType="go"
            />
          </View>

          {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
          {!!infoText && <Text style={styles.infoText}>{infoText}</Text>}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === "login" ? "Log in" : "Sign up"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  brand: {
    fontFamily: theme.fonts.display,
    color: theme.colors.primary,
    fontSize: 22,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  title: {
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
    fontSize: 26,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    alignItems: "center",
  },
  modeButtonActive: { backgroundColor: theme.colors.primary },
  modeButtonText: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  modeButtonTextActive: { color: "#fff" },
  field: { marginBottom: theme.spacing.md },
  label: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    fontFamily: theme.fonts.body,
    color: theme.colors.danger,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontFamily: theme.fonts.body,
    color: theme.colors.accent,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: theme.spacing.md,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: {
    color: "#fff",
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 15,
  },
});