// ─────────────────────────────────────────────────────────────────────────────
// INSTALL:
//   npm install express cors leetcode-query
//
// RUN:
//   node server.js
//
// TEST:
//   http://localhost:5000/leetcode/leetcode
// ─────────────────────────────────────────────────────────────────────────────

const express  = require("express");
const cors     = require("cors");
// leetcode-query handles all session/CSRF internally — no manual token needed
const { LeetCode, Cache } = require("leetcode-query");

const app = express();
app.use(cors());

// Shared LeetCode client instance (unauthenticated — public data only)
const lc = new LeetCode();

// ─── STREAK HELPER ────────────────────────────────────────────────────────────
function calcStreak(calendar) {
  const oneDaySec  = 86400;
  const todayStart = Math.floor(Date.now() / 1000 / oneDaySec) * oneDaySec;
  let streak       = 0;
  let skippedToday = false;

  for (let day = todayStart; streak < 9999; day -= oneDaySec) {
    const active = Object.keys(calendar).some((ts) => {
      const t = Number(ts);
      return t >= day && t < day + oneDaySec;
    });

    if (!active) {
      if (!skippedToday) { skippedToday = true; continue; }
      break;
    }
    skippedToday = true;
    streak++;
  }
  return streak;
}

// ─── MAIN ROUTE ───────────────────────────────────────────────────────────────
app.get("/leetcode/:username", async (req, res) => {
  const { username } = req.params;
  console.log(`\n📡 Fetching: ${username}`);

  try {
    // leetcode-query fetches everything in one clean call
    const user = await lc.user(username);

    if (!user || !user.matchedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const mu = user.matchedUser;

    // ── Solved counts ─────────────────────────────────────────────────────────
    const ac     = mu.submitStats?.acSubmissionNum ?? [];
    const findAC = (d) => ac.find((s) => s.difficulty === d) ?? { count: 0, submissions: 0 };

    const allAC    = findAC("All");
    const easyAC   = findAC("Easy");
    const mediumAC = findAC("Medium");
    const hardAC   = findAC("Hard");

    const solved      = Number(allAC.count)       || 0;
    const submissions = Number(allAC.submissions) || 0;
    const acceptance  = submissions > 0
      ? ((solved / submissions) * 100).toFixed(1)
      : "0.0";

    // ── Question totals ───────────────────────────────────────────────────────
    const allQ        = user.allQuestionsCount ?? [];
    const getQ        = (d) => allQ.find((q) => q.difficulty === d)?.count ?? 0;
    const easyTotal   = getQ("Easy");
    const mediumTotal = getQ("Medium");
    const hardTotal   = getQ("Hard");
    const total       = getQ("All") || easyTotal + mediumTotal + hardTotal;

    // ── Calendar + streak ─────────────────────────────────────────────────────
    let calendar = {};
    try { calendar = JSON.parse(mu.submissionCalendar || "{}"); } catch {}
    const streak = calcStreak(calendar);

    // ── Recent submissions ────────────────────────────────────────────────────
    const recentRaw = user.recentAcSubmissionList ?? [];
    const recentSubmissions = recentRaw.map((s) => ({
      title:         s.title     ?? "Unknown",
      titleSlug:     s.titleSlug ?? "",
      timestamp:     s.timestamp ?? "0",
      statusDisplay: "Accepted",
      lang:          s.lang      ?? "unknown",
    }));

    // ── Contest rating ────────────────────────────────────────────────────────
    const contestRating = user.userContestRanking?.rating
      ? Math.round(user.userContestRanking.rating)
      : null;

    const result = {
      username:           mu.username,
      solved,
      total,
      easy:               Number(easyAC.count)   || 0,
      medium:             Number(mediumAC.count) || 0,
      hard:               Number(hardAC.count)   || 0,
      easyTotal,
      mediumTotal,
      hardTotal,
      submissions,
      acceptance,
      ranking:            mu.profile?.ranking            ?? 0,
      contributionPoints: mu.profile?.contributionPoints ?? 0,
      contestRating,
      calendar,
      recentSubmissions,
      streak,
      progress:           total > 0 ? ((solved / total) * 100).toFixed(1) : "0.0",
    };

    console.log("✅ Done:", { username: result.username, solved: result.solved, ranking: result.ranking });
    res.json(result);

  } catch (err) {
    console.error("❌ Error:", err?.message ?? err);
    res.status(500).json({ error: err?.message ?? "Server error" });
  }
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/ping", (_req, res) => res.json({ status: "ok" }));

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✅ Server ready`);
  console.log(`🔗 Test: http://localhost:${PORT}/leetcode/leetcode\n`);
});
