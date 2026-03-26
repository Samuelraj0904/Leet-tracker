// app/welcome.tsx
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    // ✅ minHeight: "100vh" fills the full browser viewport — no white gap on web
    <View style={s.container}>
      <LinearGradient
        colors={["#04001a", "#070020", "#030015"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Aurora orbs */}
      <View style={[s.orb, { top: -80,   left: -60,  width: 280, height: 280, backgroundColor: "rgba(124,58,237,0.22)" }]} />
      <View style={[s.orb, { top: 300,   right: -80, width: 320, height: 320, backgroundColor: "rgba(6,182,212,0.12)"  }]} />
      <View style={[s.orb, { bottom: -60, left: -40,  width: 250, height: 250, backgroundColor: "rgba(236,72,153,0.12)" }]} />

      {/* Stars */}
      {[...Array(28)].map((_, i) => (
        <View key={i} style={[s.star, {
          top:  Math.sin(i * 137.5) * 420 + 440,
          left: Math.cos(i * 137.5) * 175 + 185,
          opacity: 0.1 + (i % 5) * 0.08,
          width: i % 4 === 0 ? 3 : 1.5,
          height: i % 4 === 0 ? 3 : 1.5,
        }]} />
      ))}

      <View style={s.content}>
        {/* Icon */}
        <View style={s.iconWrap}>
          <LinearGradient colors={["#7c3aed", "#4f46e5"]} style={s.iconGrad}>
            <Text style={s.iconText}>{"</>"}</Text>
          </LinearGradient>
        </View>

        <Text style={s.appName}>LeetTrack</Text>
        <Text style={s.tagline}>Master every problem.{"\n"}Track every win.</Text>

        {/* Glass card */}
        <View style={s.cardWrap}>
          <BlurView intensity={55} tint="dark" style={s.card}>
            <View style={s.cardInner}>
              <Text style={s.cardTitle}>Welcome 👋</Text>
              <Text style={s.cardBody}>
                Track your LeetCode stats, streak, skills, and contest rating — all in one place.
              </Text>

              <TouchableOpacity
                style={s.btn}
                onPress={() => router.push("/login")}
                activeOpacity={0.82}
              >
                <LinearGradient
                  colors={["#7c3aed", "#4f46e5"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.btnGrad}
                >
                  <Text style={s.btnText}>Get Started →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#04001a",
    // ✅ FIX — prevents white gap below the gradient on web
    ...(Platform.OS === "web" ? { minHeight: "100vh" as any } : {}),
  },
  orb:     { position: "absolute", borderRadius: 999 },
  star:    { position: "absolute", borderRadius: 999, backgroundColor: "#fff" },
  content: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 28 },

  iconWrap: { width: 88, height: 88, borderRadius: 44, overflow: "hidden", marginBottom: 22, shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12 },
  iconGrad: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconText: { color: "#fff", fontSize: 30, fontWeight: "800" },

  appName: { color: "#fff", fontSize: 36, fontWeight: "800", letterSpacing: -1, marginBottom: 12 },
  tagline: { color: "rgba(255,255,255,0.42)", fontSize: 16, textAlign: "center", lineHeight: 24, marginBottom: 36 },

  cardWrap:  { width: "100%", borderRadius: 26, overflow: "hidden", shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.32, shadowRadius: 28, elevation: 14 },
  card:      { borderRadius: 26 },
  cardInner: { padding: 26, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 26 },

  cardTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 10 },
  cardBody:  { color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 22, marginBottom: 24 },

  btn:     { borderRadius: 15, overflow: "hidden", shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  btnGrad: { paddingVertical: 16, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
});
