// app/login.tsx
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useUser } from "../context/UserContext";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();
  const { login, error: ctxError } = useUser();

  const handleLogin = async () => {
    const trimmed = username.trim();
    if (!trimmed) return;
    setLoading(true);
    const ok = await login(trimmed);
    if (ok) {
      router.replace("/(tabs)");
    } else {
      setLoading(false);
    }
  };

  return (
    // ✅ FIX 1 — white gap on web: minHeight 100vh fills the full browser viewport
    <View style={s.container}>
      {/* Deep space gradient covers everything including the extra web height */}
      <LinearGradient
        colors={["#04001a", "#070020", "#030015"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Aurora orbs */}
      <View style={[s.orb, { top: -100, right: -70,  width: 300, height: 300, backgroundColor: "rgba(124,58,237,0.22)" }]} />
      <View style={[s.orb, { top: 350,  left:  -90,  width: 320, height: 320, backgroundColor: "rgba(6,182,212,0.12)"  }]} />
      <View style={[s.orb, { bottom: -80, right: -50, width: 260, height: 260, backgroundColor: "rgba(236,72,153,0.12)" }]} />

      {/* Stars */}
      {[...Array(24)].map((_, i) => (
        <View key={i} style={[s.star, {
          top:  Math.sin(i * 137.5) * 380 + 420,
          left: Math.cos(i * 137.5) * 165 + 185,
          opacity: 0.12 + (i % 5) * 0.07,
          width: i % 4 === 0 ? 2.5 : 1.5,
          height: i % 4 === 0 ? 2.5 : 1.5,
        }]} />
      ))}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.inner}
      >
        {/* Logo area */}
        <View style={s.logoArea}>
          <View style={s.iconRing}>
            <LinearGradient colors={["#7c3aed", "#4f46e5"]} style={s.iconGrad}>
              <Text style={s.iconText}>{"</>"}</Text>
            </LinearGradient>
          </View>
          <Text style={s.appName}>LeetTrack</Text>
          <Text style={s.appSub}>Your competitive programming companion</Text>
        </View>

        {/* Glass card */}
        <View style={s.cardWrap}>
          <BlurView intensity={60} tint="dark" style={s.card}>
            <View style={s.cardInner}>
              <Text style={s.cardTitle}>Track your progress</Text>
              <Text style={s.cardSub}>Enter your LeetCode username below</Text>

              <View style={s.inputOuter}>
                <Text style={s.atSign}>@</Text>
                {/* ✅ FIX 2 — white input box on web: outlineStyle + border removes
                    the browser's default white <input> background and focus ring   */}
                <TextInput
                  style={s.input}
                  placeholder="username"
                  placeholderTextColor="rgba(255,255,255,0.22)"
                  value={username}
                  onChangeText={(t) => setUsername(t)}
                  onSubmitEditing={handleLogin}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="go"
                  underlineColorAndroid="transparent"
                />
              </View>

              {ctxError ? <Text style={s.error}>{ctxError}</Text> : null}

              <TouchableOpacity
                style={[s.btn, !username.trim() && { opacity: 0.45 }]}
                onPress={handleLogin}
                disabled={loading || !username.trim()}
                activeOpacity={0.82}
              >
                <LinearGradient
                  colors={["#7c3aed", "#4f46e5"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.btnGrad}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={s.btnText}>Continue →</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  // ✅ FIX 1 — minHeight fills full browser viewport on web, no-op on native
  container: {
    flex: 1,
    backgroundColor: "#04001a",
    ...(Platform.OS === "web" ? { minHeight: "100vh" as any } : {}),
  },
  orb:  { position: "absolute", borderRadius: 999 },
  star: { position: "absolute", borderRadius: 999, backgroundColor: "#fff" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },

  // Logo
  logoArea: { alignItems: "center", marginBottom: 40 },
  iconRing: { width: 76, height: 76, borderRadius: 38, overflow: "hidden", marginBottom: 18, shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 10 },
  iconGrad: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconText: { color: "#fff", fontSize: 24, fontWeight: "800" },
  appName:  { color: "#fff", fontSize: 30, fontWeight: "800", letterSpacing: -0.8 },
  appSub:   { color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 7, textAlign: "center" },

  // Card
  cardWrap:  { borderRadius: 26, overflow: "hidden", shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 28, elevation: 14 },
  card:      { borderRadius: 26 },
  cardInner: { padding: 26, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 26 },
  cardTitle: { color: "#fff", fontSize: 19, fontWeight: "700", marginBottom: 5 },
  cardSub:   { color: "rgba(255,255,255,0.38)", fontSize: 13, marginBottom: 22 },

  // Input
  inputOuter: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.35)",
    backgroundColor: "rgba(167,139,250,0.08)",
    paddingHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden", // clips any browser-injected backgrounds
  },
  atSign: { color: "#a78bfa", fontSize: 17, fontWeight: "700", marginRight: 6 },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    paddingVertical: 14,
    backgroundColor: "transparent",
    textAlignVertical: "center",
    // ✅ FIX 2 — removes white browser background + blue focus ring on web
    ...(Platform.OS === "web" ? {
      outlineStyle: "none",
      outlineWidth: 0,
      borderWidth: 0,
    } as any : {}),
  },

  error: { color: "#f87171", fontSize: 12, marginBottom: 14, textAlign: "center" },

  btn:     { borderRadius: 15, overflow: "hidden", shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  btnGrad: { paddingVertical: 16, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
});
