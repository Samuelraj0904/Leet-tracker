import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { useEffect, useRef } from "react";

const { width, height } = Dimensions.get("window");

export default function OrbBackground() {
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(orb1, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(orb2, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const move1 = {
    transform: [
      {
        translateX: orb1.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, 50],
        }),
      },
      {
        translateY: orb1.interpolate({
          inputRange: [0, 1],
          outputRange: [-30, 30],
        }),
      },
    ],
  };

  const move2 = {
    transform: [
      {
        translateX: orb2.interpolate({
          inputRange: [0, 1],
          outputRange: [40, -40],
        }),
      },
      {
        translateY: orb2.interpolate({
          inputRange: [0, 1],
          outputRange: [30, -30],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* 🔵 Blue Orb */}
      <Animated.View style={[styles.orbBlue, move1]} />

      {/* 🟠 Orange Orb */}
      <Animated.View style={[styles.orbOrange, move2]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },

  orbBlue: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#3b82f6",
    opacity: 0.2,
    top: height * 0.2,
    left: width * 0.1,
  },

  orbOrange: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#f59e0b",
    opacity: 0.2,
    bottom: height * 0.15,
    right: width * 0.1,
  },
});