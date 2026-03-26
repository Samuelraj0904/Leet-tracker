// utils/fetchLeetCode.ts
const BASE = "http://localhost:3000";

export type LanguageStat = { name: string; solved: number };
export type SkillTag     = { name: string; solved: number };

export type LeetCodeData = {
  username: string;
  solved: number;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;
  submissions: number;
  acceptance: string;
  progress: string;
  ranking: number;
  contestRating: number | null;
  contributionPoints: number;
  submissionCalendar: Record<string, number>;
  recentSubmissions: {
    title: string;
    titleSlug: string;
    timestamp: string;
    statusDisplay: string;
    lang: string;
  }[];
  streak: number;
  languages: LanguageStat[];
  skills: {
    advanced:     SkillTag[];
    intermediate: SkillTag[];
    fundamental:  SkillTag[];
  };
};

async function get(url: string): Promise<any> {
  try {
    const res = await fetch(url);
    if (!res.ok) { console.warn(`⚠️ ${url} → HTTP ${res.status}`); return null; }
    return await res.json();
  } catch (e: any) {
    console.warn(`⚠️ ${url} → ${e?.message}`);
    return null;
  }
}

function calcStreak(calendar: Record<string, number>): number {
  const oneDaySec  = 86400;
  const todayStart = Math.floor(Date.now() / 1000 / oneDaySec) * oneDaySec;
  let streak = 0, skippedToday = false;
  for (let day = todayStart; streak < 9999; day -= oneDaySec) {
    const active = Object.keys(calendar).some((ts) => {
      const t = Number(ts); return t >= day && t < day + oneDaySec;
    });
    if (!active) { if (!skippedToday) { skippedToday = true; continue; } break; }
    skippedToday = true; streak++;
  }
  return streak;
}

export const fetchLeetCode = async (username: string): Promise<LeetCodeData | null> => {
  console.log(`\n📡 fetchLeetCode("${username}")`);
  try {
    const [profile, solved, calendarData, recentData, contestData, langData, skillData] =
      await Promise.all([
        get(`${BASE}/${username}`),
        get(`${BASE}/${username}/solved`),
        get(`${BASE}/${username}/calendar`),
        get(`${BASE}/${username}/acSubmission?limit=8`),
        get(`${BASE}/${username}/contest`),
        get(`${BASE}/${username}/language`),
        get(`${BASE}/${username}/skill`),
      ]);

    if (!profile || !solved) { console.error("❌ User not found"); return null; }

    const easy        = solved.easySolved   ?? 0;
    const medium      = solved.mediumSolved ?? 0;
    const hard        = solved.hardSolved   ?? 0;
    const solvedTotal = solved.solvedProblem ?? (easy + medium + hard);
    const easyTotal   = solved.totalEasy   ?? 873;
    const mediumTotal = solved.totalMedium ?? 1829;
    const hardTotal   = solved.totalHard   ?? 790;
    const total       = easyTotal + mediumTotal + hardTotal;

    const allAC       = solved.acSubmissionNum?.find((s: any) => s.difficulty === "All");
    const submissions = Number(allAC?.submissions) || 0;
    const acceptance  = submissions > 0 ? ((solvedTotal / submissions) * 100).toFixed(1) : "0.0";
    const progress    = total > 0 ? ((solvedTotal / total) * 100).toFixed(1) : "0.0";

    let submissionCalendar: Record<string, number> = {};
    try {
      const raw = calendarData?.submissionCalendar ?? "{}";
      submissionCalendar = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {}
    const streak = calcStreak(submissionCalendar);

    const recentSubmissions = (recentData?.submission ?? []).map((s: any) => ({
      title:         s.title         ?? "Unknown",
      titleSlug:     s.titleSlug     ?? "",
      timestamp:     s.timestamp     ?? "0",
      statusDisplay: s.statusDisplay ?? "Accepted",
      lang:          s.lang          ?? "unknown",
    }));

    const contestRating = contestData?.contestRating ? Math.round(contestData.contestRating) : null;

    // ── Languages ─────────────────────────────────────────────────────────────
    // alfa-leetcode-api /language returns { languageStats: [{languageName, problemsSolved}] }
    const rawLangs = langData?.languageStats ?? langData?.matchedUser?.languageProblemCount ?? [];
    const languages: LanguageStat[] = rawLangs
      .map((l: any) => ({
        name:   l.languageName ?? l.name ?? "Unknown",
        solved: Number(l.problemsSolved ?? l.solved ?? 0),
      }))
      .filter((l: LanguageStat) => l.solved > 0)
      .sort((a: LanguageStat, b: LanguageStat) => b.solved - a.solved)
      .slice(0, 8);

    // ── Skills ────────────────────────────────────────────────────────────────
    // alfa-leetcode-api /skill returns { advanced:[{tagName,problemsSolved}], intermediate:[...], fundamental:[...] }
    const mapSkills = (arr: any[]): SkillTag[] =>
      (arr ?? [])
        .map((s: any) => ({ name: s.tagName ?? s.name ?? "Unknown", solved: Number(s.problemsSolved ?? s.solved ?? 0) }))
        .filter((s: SkillTag) => s.solved > 0)
        .sort((a: SkillTag, b: SkillTag) => b.solved - a.solved);

    const skills = {
      advanced:     mapSkills(skillData?.advanced     ?? skillData?.data?.matchedUser?.tagProblemCounts?.advanced     ?? []),
      intermediate: mapSkills(skillData?.intermediate ?? skillData?.data?.matchedUser?.tagProblemCounts?.intermediate ?? []),
      fundamental:  mapSkills(skillData?.fundamental  ?? skillData?.data?.matchedUser?.tagProblemCounts?.fundamental  ?? []),
    };

    return {
      username: profile.username ?? username,
      solved: solvedTotal, total, easy, medium, hard,
      easyTotal, mediumTotal, hardTotal,
      submissions, acceptance, progress,
      ranking:            profile.ranking            ?? 0,
      contestRating,
      contributionPoints: profile.contributionPoints ?? 0,
      submissionCalendar, recentSubmissions, streak,
      languages, skills,
    };
  } catch (err: any) {
    console.error("❌ fetchLeetCode error:", err?.message ?? err);
    return null;
  }
};
