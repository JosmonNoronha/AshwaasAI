import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { theme } from "../constants/theme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "../constants/supabase";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded, setFontsLoaded] = useState(false);
  // undefined = still checking session, null = logged out, object = logged in
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    Font.loadAsync({
      Inter_400Regular,
      Inter_600SemiBold,
      Inter_700Bold,
    }).then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sessionReady = session !== undefined;

  useEffect(() => {
    if (!sessionReady) return;

    const onLoginScreen = segments[0] === "login";
    const loggedIn = !!session;

    if (!loggedIn && !onLoginScreen) {
      router.replace("/login");
    } else if (loggedIn && onLoginScreen) {
      router.replace("/(tabs)");
    }
  }, [sessionReady, session, segments]);

  useEffect(() => {
    if (fontsLoaded && sessionReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, sessionReady]);

  if (!fontsLoaded || !sessionReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
      </Stack>
    </GestureHandlerRootView>
  );
}