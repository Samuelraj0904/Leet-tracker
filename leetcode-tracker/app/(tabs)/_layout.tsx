// app/(tabs)/_layout.tsx
// ⚠️ NO UserProvider here — it lives in app/_layout.tsx
// Adding it here creates a second empty context — that was causing "Unmatched Route"
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ACTIVE   = "#a78bfa";
const INACTIVE = "rgba(255,255,255,0.3)";

const TABS = [
  { name: "index",    label: "Home",     icon: "home",       iconOut: "home-outline"       },
  { name: "practice", label: "Practice", icon: "code-slash", iconOut: "code-slash-outline" },
  { name: "contests", label: "Contests", icon: "trophy",     iconOut: "trophy-outline"     },
  { name: "profile",  label: "Profile",  icon: "person",     iconOut: "person-outline"     },
];

function GlassTabBar({ state, navigation }: any) {
  return (
    <View style={s.outer}>
      <BlurView intensity={75} tint="dark" style={s.blur}>
        <View style={s.inner}>
          {TABS.map((tab, index) => {
            const focused = state.index === index;
            return (
              <TouchableOpacity
                key={tab.name}
                style={s.item}
                onPress={() => navigation.navigate(tab.name)}
                activeOpacity={0.7}
              >
                {focused && <View style={s.glow} />}
                <Ionicons
                  name={(focused ? tab.icon : tab.iconOut) as any}
                  size={22}
                  color={focused ? ACTIVE : INACTIVE}
                />
                <Text style={[s.label, { color: focused ? ACTIVE : INACTIVE }]}>
                  {tab.label}
                </Text>
                {focused && <View style={s.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"    />
      <Tabs.Screen name="practice" />
      <Tabs.Screen name="contests" />
      <Tabs.Screen name="profile"  />
    </Tabs>
  );
}

const s = StyleSheet.create({
  outer: {
    position: "absolute", bottom: 20, left: 16, right: 16,
    borderRadius: 32, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(167,139,250,0.25)",
    shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 20,
  },
  blur:  { backgroundColor: "rgba(6,0,20,0.85)" },
  inner: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 4 },
  item:  { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 4, position: "relative" },
  glow:  { position: "absolute", width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(139,92,246,0.18)" },
  label: { fontSize: 10, fontWeight: "600", marginTop: 3, letterSpacing: 0.2 },
  dot:   { width: 4, height: 4, borderRadius: 2, backgroundColor: ACTIVE, marginTop: 2 },
});
