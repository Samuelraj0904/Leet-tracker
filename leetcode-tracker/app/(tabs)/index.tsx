// app/(tabs)/index.tsx
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../context/UserContext";
import CircularProgress from "../../components/CircularProgress";

// ─── Difficulty card (right column) ──────────────────────────────────────────
function DiffCard({
  label, solved, total, color,
}: { label: string; solved: number; total: number; color: string }) {
  return (
    <View style={dc.card}>
      <Text style={[dc.label, { color }]}>{label}</Text>
      <Text style={dc.value}>
        {solved}
        <Text style={dc.total}>/{total}</Text>
      </Text>
    </View>
  );
}

// ─── Profile stat cell (2×2 grid) ────────────────────────────────────────────
function StatCell({
  label, value, accent, icon,
}: { label: string; value: string | number; accent?: string; icon?: string }) {
  return (
    <View style={sc.cell}>
      <Text style={sc.label}>{icon ? `${icon} ${label}` : label}</Text>
      <Text style={[sc.value, accent ? { color: accent } : {}]}>{value}</Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { username, data, loading, refetch } = useUser();

  if (loading && !data) {
    return (
      <View style={s.center}>
        <LinearGradient colors={["#04001a", "#070020"]} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={s.loadingText}>Loading stats…</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <LinearGradient colors={["#04001a", "#070020", "#030015"]} style={StyleSheet.absoluteFill} />
      <View style={[s.orb, { top: -80, right: -60, width: 260, height: 260, backgroundColor: "rgba(124,58,237,0.18)" }]} />
      <View style={[s.orb, { bottom: 80, left: -80, width: 280, height: 280, backgroundColor: "rgba(6,182,212,0.09)" }]} />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#7c3aed" />}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Welcome back 👋</Text>
            <Text style={s.username}>@{username}</Text>
          </View>
          <TouchableOpacity onPress={refetch} style={s.refreshBtn} activeOpacity={0.7}>
            <Ionicons name="refresh" size={20} color="#a78bfa" />
          </TouchableOpacity>
        </View>

        {data ? (
          <>
            {/* ── Hero card: ring + diff cards ── */}
            <View style={s.heroCard}>
              {/* Left — circular ring */}
              <CircularProgress
                size={170}
                strokeWidth={14}
                easy={data.easy}
                medium={data.medium}
                hard={data.hard}
                total={data.total}
              />

              {/* Right — stacked diff cards */}
              <View style={s.diffStack}>
                <DiffCard label="Easy"   solved={data.easy}   total={data.easyTotal}   color="#22c55e" />
                <DiffCard label="Med."   solved={data.medium} total={data.mediumTotal} color="#facc15" />
                <DiffCard label="Hard"   solved={data.hard}   total={data.hardTotal}   color="#ef4444" />
              </View>
            </View>

            {/* ── Profile Stats 2×2 grid ── */}
            <View style={s.statsSection}>
              <Text style={s.statsHeading}>Profile Stats</Text>
              <View style={s.statsGrid}>
                <StatCell label="Ranking"     value={`#${(data.ranking ?? 0).toLocaleString()}`} />
                <StatCell label="Submissions" value={data.submissions} />
                <StatCell label="Acceptance"  value={`${data.acceptance}%`} />
                <StatCell label="Streak"      value={`${data.streak} days`} accent="#f59e0b" icon="🔥" />
              </View>
            </View>

            {/* ── Recent submissions ── */}
            {data.recentSubmissions?.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Recent Submissions</Text>
                <BlurView intensity={50} tint="dark" style={s.glass}>
                  <View style={s.glassInner}>
                    {data.recentSubmissions.slice(0, 6).map((sub, i) => (
                      <View key={i} style={sub_s.row}>
                        <View style={[sub_s.dot, {
                          backgroundColor: sub.statusDisplay === "Accepted" ? "#22c55e" : "#ef4444",
                        }]} />
                        <Text style={sub_s.title} numberOfLines={1}>{sub.title}</Text>
                        <Text style={sub_s.lang}>{sub.lang}</Text>
                      </View>
                    ))}
                  </View>
                </BlurView>
              </View>
            )}

            {/* ── Languages ── */}
            {data.languages?.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Languages</Text>
                <View style={s.chipRow}>
                  {data.languages.slice(0, 6).map((l, i) => (
                    <View key={i} style={chip_s.chip}>
                      <Text style={chip_s.name}>{l.name}</Text>
                      <Text style={chip_s.count}>{l.solved}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ── Skills ── */}
            {data.skills?.advanced?.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Top Skills</Text>
                <BlurView intensity={50} tint="dark" style={s.glass}>
                  <View style={s.glassInner}>
                    {[...data.skills.advanced.slice(0, 3), ...data.skills.intermediate.slice(0, 2)].map((sk, i) => (
                      <View key={i} style={sk_s.row}>
                        <Text style={sk_s.name}>{sk.name}</Text>
                        <Text style={sk_s.count}>{sk.solved} solved</Text>
                      </View>
                    ))}
                  </View>
                </BlurView>
              </View>
            )}
          </>
        ) : (
          <View style={s.emptyWrap}>
            <Text style={s.emptyText}>Could not load data.{"\n"}Pull down to retry.</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: "#04001a" },
  center:      { flex: 1, backgroundColor: "#04001a", alignItems: "center", justifyContent: "center" },
  loadingText: { color: "rgba(255,255,255,0.4)", marginTop: 12, fontSize: 14 },
  orb:         { position: "absolute", borderRadius: 999 },
  scroll:      { paddingHorizontal: 20, paddingTop: 64 },

  header:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  greeting:   { color: "rgba(255,255,255,0.4)", fontSize: 13 },
  username:   { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 2 },
  refreshBtn: { padding: 8, borderRadius: 12, backgroundColor: "rgba(167,139,250,0.12)" },

  // Hero card — dark rounded box like image 2
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    gap: 14,
  },
  diffStack: { flex: 1, gap: 8 },

  // Profile Stats
  statsSection: { marginBottom: 20 },
  statsHeading: { color: "#fff", fontSize: 18, fontWeight: "800", marginBottom: 12 },
  statsGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  section:      { marginBottom: 18 },
  sectionTitle: { color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  glass:        { borderRadius: 22, overflow: "hidden" },
  glassInner:   { padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", borderRadius: 22 },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  emptyWrap: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 22 },
});

// Diff card styles
const dc = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  value: { color: "#fff", fontSize: 16, fontWeight: "700" },
  total: { color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: "400" },
});

// Stat cell styles
const sc = StyleSheet.create({
  cell: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
  },
  label: { color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 6 },
  value: { color: "#fff", fontSize: 22, fontWeight: "800" },
});

const sub_s = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" },
  dot:   { width: 7, height: 7, borderRadius: 4, marginRight: 10 },
  title: { flex: 1, color: "#fff", fontSize: 13 },
  lang:  { color: "rgba(255,255,255,0.3)", fontSize: 11, marginLeft: 8 },
});

const chip_s = StyleSheet.create({
  chip:  { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(167,139,250,0.1)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  name:  { color: "#a78bfa", fontSize: 12, fontWeight: "600" },
  count: { color: "rgba(255,255,255,0.35)", fontSize: 11 },
});

const sk_s = StyleSheet.create({
  row:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" },
  name:  { color: "#e2e8f0", fontSize: 13, fontWeight: "600" },
  count: { color: "rgba(255,255,255,0.35)", fontSize: 12 },
});
