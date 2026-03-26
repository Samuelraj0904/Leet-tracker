import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useEffect, useState } from "react";

const symbols = [
  "(", ")", "+", "-", "*", "/", "#", "@", "!",
  "?", "{", "}", ";", ":", "%", "&"
];

export default function CodeBackground() {
  const { width, height } = useWindowDimensions();

  const [animations, setAnimations] = useState<
    { x: Animated.Value; y: Animated.Value }[]
  >([]);

  useEffect(() => {
    const newAnimations = symbols.map(() => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
    }));

    setAnimations(newAnimations);

    newAnimations.forEach((anim) => {
      const animate = () => {
        Animated.parallel([
          Animated.timing(anim.x, {
            toValue: width / 2,
            duration: 4000 + Math.random() * 2000,
            useNativeDriver: false,
          }),
          Animated.timing(anim.y, {
            toValue: height / 2,
            duration: 4000 + Math.random() * 2000,
            useNativeDriver: false,
          }),
        ]).start(() => {
          anim.x.setValue(Math.random() * width);
          anim.y.setValue(Math.random() * height);
          animate();
        });
      };

      animate();
    });
  }, [width, height]);

  return (
    <View style={styles.container}>
      {animations.map((anim, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.symbol,
            {
              transform: [
                { translateX: anim.x },
                { translateY: anim.y },
              ],
            },
          ]}
        >
          {symbols[index % symbols.length]}
        </Animated.Text>
      ))}

      {/* center black hole */}
      <View
        style={[
          styles.blackHole,
          {
            top: height / 2 - 15,
            left: width / 2 - 15,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  symbol: {
    position: "absolute",
    color: "#00ffff",
    fontSize: 28,
    opacity: 0.9, 
  },
  blackHole: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#000",
  },
});