import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

// Arc spans 270°, gap at the bottom (~4:30 to ~7:30)
// rotation=135 puts the start at 7:30 (3 o'clock + 135° clockwise = 7:30)
const ARC_DEGREES = 270;
const START_ROTATION = 135;

export default function CircularProgress({
  size = 200,
  strokeWidth = 16,
  easy = 69,
  medium = 83,
  hard = 18,
  total = 3878,
}: {
  size?: number;
  strokeWidth?: number;
  easy?: number;
  medium?: number;
  hard?: number;
  total?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Total visible arc in px (270° of the full circumference)
  const arcLength = circumference * (ARC_DEGREES / 360);

  const solved = easy + medium + hard;

  // Each segment is proportional to one another so they fill the full 270° arc.
  // This matches the reference image where the ring appears almost fully colored.
  const easyLength   = solved > 0 ? (easy   / solved) * arcLength : 0;
  const mediumLength = solved > 0 ? (medium / solved) * arcLength : 0;
  const hardLength   = solved > 0 ? (hard   / solved) * arcLength : 0;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation={START_ROTATION} origin={`${size / 2}, ${size / 2}`}>

          {/* Background track — visible as 270° arc only */}
          <Circle
            stroke="#2a2a2a"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* EASY — green, starts at 7:30 going up the left side */}
          <Circle
            stroke="#22c55e"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${easyLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
          />

          {/* MEDIUM — muted dark olive/gold, spans the top */}
          <Circle
            stroke="#b8960c"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${mediumLength} ${circumference}`}
            strokeDashoffset={-easyLength}
            strokeLinecap="round"
          />

          {/* HARD — dark maroon, right side going down to ~4:30 */}
          <Circle
            stroke="#7c1d1d"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${hardLength} ${circumference}`}
            strokeDashoffset={-(easyLength + mediumLength)}
            strokeLinecap="round"
          />

        </G>
      </Svg>

      {/* Center labels */}
      <View style={styles.center}>
        <View style={styles.countRow}>
          <Text style={styles.number}>{solved}</Text>
          <Text style={styles.total}>/{total}</Text>
        </View>

        <View style={styles.solvedRow}>
          <Text style={styles.checkmark}>✓ </Text>
          <Text style={styles.solvedLabel}>Solved</Text>
        </View>

        <Text style={styles.attempt}>0 Attempting</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  center: {
    position: "absolute",
    alignItems: "center",
  },

  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  number: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  total: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "400",
    marginLeft: 1,
  },

  solvedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  checkmark: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "700",
  },

  solvedLabel: {
    color: "#d1d5db",
    fontSize: 15,
    fontWeight: "500",
  },

  attempt: {
    color: "#4b5563",
    fontSize: 12,
    marginTop: 6,
  },
});
