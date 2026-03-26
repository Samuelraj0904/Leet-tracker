// app/(tabs)/practice.tsx
import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const BASE = "http://localhost:3000";

type Problem = {
  title: string;
  titleSlug: string;
  difficulty: string;
  acRate: number;
  topicTags?: { name: string }[];
};

type DailyQuestion = {
  title: string;
  titleSlug: string;
  difficulty: string;
  acRate: number;
  topicTags?: { name: string }[];
  date: string;
};

const TOPICS = [
  { name: "Array",            slug: "array",               emoji: "📦" },
  { name: "String",           slug: "string",              emoji: "🔤" },
  { name: "Dynamic Prog.",    slug: "dynamic-programming", emoji: "🧠" },
  { name: "Tree",             slug: "tree",                emoji: "🌳" },
  { name: "Graph",            slug: "graph",               emoji: "🕸️" },
  { name: "Binary Search",    slug: "binary-search",       emoji: "🔍" },
  { name: "Two Pointers",     slug: "two-pointers",        emoji: "👆" },
  { name: "Sliding Window",   slug: "sliding-window",      emoji: "🪟" },
  { name: "Linked List",      slug: "linked-list",         emoji: "🔗" },
  { name: "Stack",            slug: "stack",               emoji: "📚" },
  { name: "Hash Table",       slug: "hash-table",          emoji: "🗂️" },
  { name: "Backtracking",     slug: "backtracking",        emoji: "↩️" },
  { name: "Heap / PQ",        slug: "heap-priority-queue", emoji: "🔺" },
  { name: "Greedy",           slug: "greedy",              emoji: "💰" },
  { name: "Math",             slug: "math",                emoji: "➗" },
  { name: "Bit Manipulation", slug: "bit-manipulation",    emoji: "⚙️" },
];

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"] as const;
type Difficulty = typeof DIFFICULTIES[number];

const DIFF_COLOR: Record<string, string> = {
  Easy:   "#22c55e",
  Medium: "#facc15",
  Hard:   "#ef4444",
};

// ─── Daily Question Card ─────────────────────────────────────────────────────

function DailyCard({ daily, loading }: { daily: DailyQuestion | null; loading: boolean }) {
  const color = DIFF_COLOR[daily?.difficulty ?? ""] ?? "#a78bfa";
  const url   = daily ? `https://leetcode.com/problems/${daily.titleSlug}/` : "";

  return (
    <View style={dc.wrap}>
      <BlurView intensity={60} tint="dark" style={dc.blur}>
        <LinearGradient
          colors={["rgba(124,58,237,0.18)", "rgba(79,70,229,0.08)"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={dc.gradient}
        >
          {/* header row */}
          <View style={dc.headerRow}>
            <View style={dc.badge}>
              <Text style={dc.badgeText}>⚡ Daily Challenge</Text>
            </View>
            {daily && (
              <Text style={dc.date}>{daily.date}</Text>
            )}
          </View>

          {loading ? (
            <View style={dc.loadingRow}>
              <ActivityIndicator color="#a78bfa" size="small" />
              <Text style={dc.loadingText}>Fetching today's problem…</Text>
            </View>
          ) : daily ? (
            <>
              <Text style={dc.title} numberOfLines={2}>{daily.title}</Text>

              {/* tags */}
              {daily.topicTags && daily.topicTags.length > 0 && (
                <View style={dc.tagRow}>
                  {daily.topicTags.slice(0, 3).map((t, i) => (
                    <View key={i} style={dc.tag}>
                      <Text style={dc.tagText}>{t.name}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* footer */}
              <View style={dc.footer}>
                <View style={[dc.diffBadge, { backgroundColor: color + "18", borderColor: color + "50" }]}>
                  <Text style={[dc.diffText, { color }]}>{daily.difficulty}</Text>
                </View>
                <Text style={dc.acRate}>{daily.acRate?.toFixed(1) ?? "?"}% acceptance</Text>
                <TouchableOpacity
                  style={dc.solveBtn}
                  onPress={() => Linking.openURL(url)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#7c3aed", "#4f46e5"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={dc.solveBtnInner}
                  >
                    <Text style={dc.solveBtnText}>Solve →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={dc.loadingText}>Could not load today's problem.</Text>
          )}
        </LinearGradient>
      </BlurView>
    </View>
  );
}

// ─── Aurora background ───────────────────────────────────────────────────────

function AuroraBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={["#04001a", "#080028", "#030018"]} style={StyleSheet.absoluteFill} />
      <View style={[styles.blob, { top: 0,   right: -40, width: 250, height: 250, backgroundColor: "rgba(56,189,248,0.1)"  }]} />
      <View style={[styles.blob, { top: 300, left: -60,  width: 280, height: 280, backgroundColor: "rgba(139,92,246,0.12)" }]} />
      <View style={[styles.blob, { top: 700, right: -30, width: 200, height: 200, backgroundColor: "rgba(34,197,94,0.08)"  }]} />
    </View>
  );
}

// ─── Problem card ────────────────────────────────────────────────────────────

function ProblemCard({ problem }: { problem: Problem }) {
  const color = DIFF_COLOR[problem.difficulty] ?? "#6b7280";
  const url   = `https://leetcode.com/problems/${problem.titleSlug}/`;
  return (
    <TouchableOpacity style={styles.problemCard} onPress={() => Linking.openURL(url)} activeOpacity={0.75}>
      <View style={styles.problemLeft}>
        <Text style={styles.problemTitle} numberOfLines={1}>{problem.title}</Text>
        <Text style={styles.problemAc}>{problem.acRate?.toFixed(1) ?? "?"}% acceptance</Text>
      </View>
      <View style={[styles.diffBadge, { backgroundColor: color + "18", borderColor: color + "40" }]}>
        <Text style={[styles.diffBadgeText, { color }]}>{problem.difficulty}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function PracticeScreen() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDiff,  setSelectedDiff]  = useState<Difficulty>("All");
  const [problems,      setProblems]      = useState<Problem[]>([]);
  const [loadingProbs,  setLoadingProbs]  = useState(false);
  const [page,          setPage]          = useState(0);
  const [hasMore,       setHasMore]       = useState(true);

  const [daily,        setDaily]        = useState<DailyQuestion | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(true);

  // Fetch daily question on mount
  useEffect(() => {
    (async () => {
      setLoadingDaily(true);
      try {
        const res  = await fetch(`${BASE}/daily`);
        const data = await res.json();
        // alfa-leetcode-api returns { problemName, titleSlug, difficulty, acRate, topicTags, date }
        // or nested under data.activeDailyCodingChallengeQuestion.question
        const q =
          data?.question ??
          data?.data?.activeDailyCodingChallengeQuestion?.question ??
          data;

        setDaily({
          title:      q?.title      ?? data?.problemName ?? "Daily Problem",
          titleSlug:  q?.titleSlug  ?? data?.titleSlug   ?? "",
          difficulty: q?.difficulty ?? data?.difficulty  ?? "Medium",
          acRate:     Number(q?.acRate ?? data?.acRate   ?? 0),
          topicTags:  q?.topicTags  ?? data?.topicTags   ?? [],
          date:       data?.date    ?? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        });
      } catch {
        setDaily(null);
      } finally {
        setLoadingDaily(false);
      }
    })();
  }, []);

  const fetchProblems = async (tag: string, diff: Difficulty, skip = 0) => {
    setLoadingProbs(true);
    try {
      let url = `${BASE}/problems?limit=15&skip=${skip}`;
      if (tag)          url += `&tags=${tag}`;
      if (diff !== "All") url += `&difficulty=${diff.toUpperCase()}`;
      const res  = await fetch(url);
      const data = await res.json();
      const list: Problem[] = data?.problemsetQuestionList ?? data?.problems ?? [];
      if (skip === 0) setProblems(list);
      else setProblems(prev => [...prev, ...list]);
      setHasMore(list.length === 15);
    } catch {
      setProblems([]);
    } finally {
      setLoadingProbs(false);
    }
  };

  useEffect(() => {
    if (selectedTopic) {
      setPage(0);
      fetchProblems(selectedTopic, selectedDiff, 0);
    }
  }, [selectedTopic, selectedDiff]);

  const loadMore = () => {
    if (!loadingProbs && hasMore && selectedTopic) {
      const next = page + 1;
      setPage(next);
      fetchProblems(selectedTopic, selectedDiff, next * 15);
    }
  };

  return (
    <View style={styles.container}>
      <AuroraBackground />
      <ScrollView contentContainerStyle={styles.wrapper} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSub}>LeetCode</Text>
            <Text style={styles.header}>Practice</Text>
          </View>
          <View style={styles.codeBadge}>
            <Text style={{ fontSize: 26 }}>💡</Text>
          </View>
        </View>

        {/* ── Daily Question ── */}
        <DailyCard daily={daily} loading={loadingDaily} />

        {/* Topic Grid */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Topics</Text>
        </View>
        <View style={styles.topicGrid}>
          {TOPICS.map((topic) => {
            const isSelected = selectedTopic === topic.slug;
            return (
              <TouchableOpacity
                key={topic.slug}
                style={[styles.topicChip, isSelected && styles.topicChipActive]}
                onPress={() => setSelectedTopic(isSelected ? null : topic.slug)}
                activeOpacity={0.75}
              >
                <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                <Text style={[styles.topicName, isSelected && styles.topicNameActive]}>
                  {topic.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Difficulty filter + problem list */}
        {selectedTopic && (
          <>
            <View style={styles.diffFilterRow}>
              {DIFFICULTIES.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.diffChip,
                    selectedDiff === d && styles.diffChipActive,
                    selectedDiff === d && d !== "All" && { borderColor: DIFF_COLOR[d] + "80", backgroundColor: DIFF_COLOR[d] + "15" },
                  ]}
                  onPress={() => setSelectedDiff(d)}
                >
                  <Text style={[
                    styles.diffChipText,
                    selectedDiff === d && d !== "All" && { color: DIFF_COLOR[d] },
                    selectedDiff === d && d === "All" && { color: "#a78bfa" },
                  ]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.problemsSection}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>
                  {TOPICS.find(t => t.slug === selectedTopic)?.name} Problems
                </Text>
                {!loadingProbs && <Text style={styles.problemCount}>{problems.length} shown</Text>}
              </View>

              {loadingProbs && problems.length === 0 ? (
                <View style={styles.center}>
                  <ActivityIndicator color="#a78bfa" size="large" />
                  <Text style={styles.loadingText}>Fetching problems...</Text>
                </View>
              ) : problems.length === 0 ? (
                <Text style={styles.emptyText}>No problems found</Text>
              ) : (
                <View style={styles.cardWrapper}>
                  <BlurView intensity={60} tint="dark" style={styles.problemList}>
                    <View style={styles.problemListInner}>
                      {problems.map((p, i) => <ProblemCard key={p.titleSlug + i} problem={p} />)}
                      {hasMore && (
                        <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore} disabled={loadingProbs}>
                          {loadingProbs
                            ? <ActivityIndicator color="#a78bfa" size="small" />
                            : <Text style={styles.loadMoreText}>Load more ↓</Text>
                          }
                        </TouchableOpacity>
                      )}
                    </View>
                  </BlurView>
                </View>
              )}
            </View>
          </>
        )}

        {!selectedTopic && (
          <View style={styles.center}>
            <Text style={styles.pickText}>👆 Pick a topic to get started</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const dc = StyleSheet.create({
  wrap:     { marginBottom: 24, borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: "rgba(167,139,250,0.25)" },
  blur:     { borderRadius: 22 },
  gradient: { padding: 20, borderRadius: 22 },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  badge:     { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(167,139,250,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: "#c4b5fd", fontSize: 12, fontWeight: "700" },
  date:      { color: "rgba(255,255,255,0.35)", fontSize: 12 },

  loadingRow:  { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  loadingText: { color: "rgba(255,255,255,0.4)", fontSize: 13 },

  title: { color: "#fff", fontSize: 17, fontWeight: "800", lineHeight: 24, marginBottom: 10 },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  tag:    { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagText:{ color: "rgba(255,255,255,0.5)", fontSize: 11 },

  footer:      { flexDirection: "row", alignItems: "center", gap: 10 },
  diffBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  diffText:    { fontSize: 12, fontWeight: "700" },
  acRate:      { flex: 1, color: "rgba(255,255,255,0.35)", fontSize: 12 },
  solveBtn:    { borderRadius: 12, overflow: "hidden" },
  solveBtnInner: { paddingHorizontal: 18, paddingVertical: 9 },
  solveBtnText:  { color: "#fff", fontSize: 13, fontWeight: "700" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04001a" },
  blob:      { position: "absolute", borderRadius: 999 },
  wrapper:   { padding: 16, paddingTop: 60 },
  center:    { alignItems: "center", marginTop: 40 },

  headerRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerSub:  { color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: 0.5 },
  header:     { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  codeBadge:  { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(56,189,248,0.1)", borderWidth: 1, borderColor: "rgba(56,189,248,0.2)", alignItems: "center", justifyContent: "center" },

  sectionTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle:    { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.2 },
  problemCount:    { color: "rgba(255,255,255,0.35)", fontSize: 12 },

  topicGrid:      { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  topicChip:      { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  topicChipActive:{ backgroundColor: "rgba(167,139,250,0.15)", borderColor: "rgba(167,139,250,0.5)" },
  topicEmoji:     { fontSize: 14 },
  topicName:      { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600" },
  topicNameActive:{ color: "#c4b5fd" },

  diffFilterRow:  { flexDirection: "row", gap: 8, marginBottom: 16 },
  diffChip:       { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  diffChipActive: { backgroundColor: "rgba(167,139,250,0.1)", borderColor: "rgba(167,139,250,0.4)" },
  diffChipText:   { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600" },

  problemsSection:  { marginBottom: 10 },
  cardWrapper:      { borderRadius: 20, overflow: "hidden" },
  problemList:      { borderRadius: 20 },
  problemListInner: { padding: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 20 },

  problemCard:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" },
  problemLeft:  { flex: 1, marginRight: 10 },
  problemTitle: { color: "#e2e8f0", fontSize: 13, fontWeight: "600" },
  problemAc:    { color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 },
  diffBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  diffBadgeText:{ fontSize: 11, fontWeight: "700" },

  loadMoreBtn:  { alignItems: "center", paddingVertical: 14 },
  loadMoreText: { color: "#a78bfa", fontSize: 13, fontWeight: "600" },

  loadingText: { color: "#a78bfa", fontSize: 14, marginTop: 12 },
  emptyText:   { color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", marginTop: 20 },
  pickText:    { color: "rgba(255,255,255,0.3)", fontSize: 15, marginTop: 20 },
});
