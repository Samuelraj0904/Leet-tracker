// app/(tabs)/contests.tsx

import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width: SW } = Dimensions.get("window");
const BASE = "http://localhost:3000";

type Contest = {
  title: string;
  startTime: number;
  duration: number;
  isVirtual?: boolean;
};

function AuroraBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={["#04001a", "#080028", "#030018"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, { top: -60, right: -60, width: 260, height: 260, backgroundColor: "rgba(124,58,237,0.14)" }]} />
      <View style={[styles.blob, { top: 200, left: -80, width: 300, height: 300, backgroundColor: "rgba(16,185,129,0.1)" }]} />
      <View style={[styles.blob, { top: 500, right: -40, width: 200, height: 200, backgroundColor: "rgba(236,72,153,0.1)" }]} />
    </View>
  );
}

function useCountdown(targetUnix: number) {
  const [remaining, setRemaining] = useState(targetUnix - Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(targetUnix - Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetUnix]);

  if (remaining <= 0) return { label: "Live Now 🟢", color: "#22c55e", isLive: true };

  const d = Math.floor(remaining / 86400);
  const h = Math.floor((remaining % 86400) / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  if (d > 0) return { label: `${d}d ${h}h ${m}m`, color: "#a78bfa", isLive: false };
  if (h > 0) return { label: `${h}h ${m}m ${s}s`, color: "#facc15", isLive: false };
  return { label: `${m}m ${s}s`, color: "#f87171", isLive: false };
}

function formatDate(unix: number) {
  const d = new Date(unix * 1000);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatDuration(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function ContestCard({ contest }: { contest: Contest }) {
  const { label, color, isLive } = useCountdown(contest.startTime);
  const isWeekly = contest.title.toLowerCase().includes("weekly");
  const accentColor = isWeekly ? "#a78bfa" : "#34d399";

  return (
    <View style={[styles.cardWrapper, { shadowColor: accentColor + "50" }]}>
      <BlurView intensity={65} tint="dark" style={styles.card}>
        <View style={[styles.cardContent, { borderColor: accentColor + "25" }]}>

          {/* Top badge */}
          <View style={styles.cardTop}>
            <View style={[styles.typeBadge, { backgroundColor: accentColor + "20", borderColor: accentColor + "40" }]}>
              <Text style={[styles.typeBadgeText, { color: accentColor }]}>
                {isWeekly ? "⚡ Weekly" : "🏅 Biweekly"}
              </Text>
            </View>
            {isLive && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>🟢 LIVE</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.contestTitle} numberOfLines={2}>{contest.title}</Text>

          {/* Countdown */}
          <View style={[styles.countdownBox, { borderColor: color + "30", backgroundColor: color + "10" }]}>
            <Text style={styles.countdownLabel}>{isLive ? "Happening now" : "Starts in"}</Text>
            <Text style={[styles.countdownValue, { color }]}>{label}</Text>
          </View>

          {/* Info row */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoText}>{formatDate(contest.startTime)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>⏱</Text>
              <Text style={styles.infoText}>{formatDuration(contest.duration)}</Text>
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

export default function ContestsScreen() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    fetch(`${BASE}/contests/upcoming`)
      .then(r => r.json())
      .then(data => {
        const list = data?.contests ?? data?.upcomingContests ?? [];
        setContests(list);
      })
      .catch(() => setError("Could not load contests"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <AuroraBackground />
      <ScrollView contentContainerStyle={styles.wrapper} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSub}>LeetCode</Text>
            <Text style={styles.header}>Contests</Text>
          </View>
          <View style={styles.trophyBadge}>
            <Text style={{ fontSize: 28 }}>🏆</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <Text style={styles.loadingText}>Loading contests...</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : contests.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No upcoming contests</Text>
          </View>
        ) : (
          contests.map((c, i) => <ContestCard key={i} contest={c} />)
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04001a" },
  blob:      { position: "absolute", borderRadius: 999 },
  wrapper:   { padding: 16, paddingTop: 60 },
  center:    { alignItems: "center", marginTop: 60 },

  headerRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  headerSub:  { color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: 0.5 },
  header:     { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  trophyBadge:{ width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(167,139,250,0.1)", borderWidth: 1, borderColor: "rgba(167,139,250,0.2)", alignItems: "center", justifyContent: "center" },

  loadingText: { color: "#a78bfa", fontSize: 15 },
  emptyText:   { color: "rgba(255,255,255,0.3)", fontSize: 14 },
  errorText:   { color: "#f87171", textAlign: "center", marginTop: 40 },

  cardWrapper: {
    marginBottom: 16, borderRadius: 24, overflow: "hidden",
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  card:        { borderRadius: 24 },
  cardContent: { padding: 18, borderWidth: 1, borderRadius: 24 },

  cardTop:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  typeBadgeText: { fontSize: 12, fontWeight: "700" },
  liveBadge: { backgroundColor: "rgba(34,197,94,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  liveBadgeText: { color: "#22c55e", fontSize: 12, fontWeight: "700" },

  contestTitle: { color: "#fff", fontSize: 17, fontWeight: "700", marginBottom: 14, lineHeight: 24 },

  countdownBox:   { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 14, alignItems: "center" },
  countdownLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  countdownValue: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },

  infoRow:  { flexDirection: "row", gap: 16 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoIcon: { fontSize: 13 },
  infoText: { color: "rgba(255,255,255,0.45)", fontSize: 12 },
});
