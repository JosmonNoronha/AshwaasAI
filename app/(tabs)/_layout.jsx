import { Tabs } from "expo-router";
import { theme } from "../../constants/theme";
import { View, Text, StyleSheet } from "react-native";

function TabIcon({ label, focused }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {label}
      </Text>
      <View style={[styles.tabDot, focused && styles.tabDotFocused]} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Home" focused={focused} />
          ),
        }}
      />
      {/* Chat removed from tabs - access conversations from Home instead */}
      <Tabs.Screen
        name="mood"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Mood" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    gap: 6,
  },
  tabItemFocused: { backgroundColor: theme.colors.primaryGlow },
  tabLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodySemiBold,
  },
  tabLabelFocused: { color: theme.colors.primary },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.textMuted,
    opacity: 0.7,
  },
  tabDotFocused: { backgroundColor: theme.colors.primary, opacity: 1 },
});
