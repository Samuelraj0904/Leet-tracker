// app/_layout.tsx  ← ROOT layout (the one that was missing)
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { UserProvider, useUser } from "../context/UserContext";

/** Handles redirect logic — must be a child of UserProvider */
function RootNavigator() {
  const { username, authLoading } = useUser();
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (authLoading) return; // wait until AsyncStorage check is done

    const inTabs    = segments[0] === "(tabs)";
    const inAuth    = segments[0] === "welcome" || segments[0] === "login";

    if (username && !inTabs) {
      // Logged in → go to main app
      router.replace("/(tabs)");
    } else if (!username && !inAuth) {
      // Not logged in → go to welcome
      router.replace("/welcome");
    }
  }, [username, authLoading]);

  // Show a full-screen loader while checking stored credentials
  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#04001a", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      {/* Auth screens */}
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login"   />

      {/* Main tabs */}
      <Stack.Screen name="(tabs)" />

      {/* Optional modal */}
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <RootNavigator />
    </UserProvider>
  );
}
