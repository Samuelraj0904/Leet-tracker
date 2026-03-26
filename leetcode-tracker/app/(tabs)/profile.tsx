// app/(tabs)/profile.tsx
import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useUser } from "../../context/UserContext";
import { LanguageStat, SkillTag } from "../../utils/fetchLeetCode";

const LANG_COLOR: Record<string, string> = {
  python3: "#3b82f6", python: "#3b82f6", java: "#f97316",
  cpp: "#a855f7", c: "#6b7280", javascript: "#eab308",
  typescript: "#38bdf8", go: "#22d3ee", rust: "#ef4444",
  kotlin: "#ec4899", swift: "#f97316", mysql: "#00758f",
};
const SKILL_COLORS = {
  advanced:     { bar: ["#ff6b6b", "#ee0979"] as [string,string] },
  intermediate: { bar: ["#f7971e", "#ffd200"] as [string,string] },
  fundamental:  { bar: ["#00b4db", "#0083b0"] as [string,string] },
};

const timeSince = (ts: string) => {
  const d = Date.now() / 1000 - Number(ts);
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};

const buildHeatmap = (cal: Record<string, number>) => {
  const map: Record<number, number> = {};
  Object.entries(cal).forEach(([ts, n]) => {
    const d = new Date(Number(ts) * 1000); d.setHours(0,0,0,0);
    map[d.getTime()] = (map[d.getTime()] || 0) + Number(n);
  });
  const weeks: { date: number; count: number }[][] = [];
  const cur = new Date(); cur.setHours(0,0,0,0);
  for (let w = 0; w < 24; w++) {
    const wk: { date: number; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      wk.unshift({ date: cur.getTime(), count: map[cur.getTime()] || 0 });
      cur.setDate(cur.getDate() - 1);
    }
    weeks.unshift(wk);
  }
  return weeks;
};

const heatColor = (c: number) => {
  if (c === 0) return "rgba(255,255,255,0.06)";
  if (c <= 2)  return "#14532d";
  if (c <= 5)  return "#16a34a";
  if (c <= 9)  return "#22c55e";
  return "#4ade80";
};

function AuroraBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={["#04001a","#070020","#030015"]} style={StyleSheet.absoluteFill}/>
      <View style={[s.orb,{top:-80,  left:-60, width:280,height:280,backgroundColor:"rgba(124,58,237,0.22)"}]}/>
      <View style={[s.orb,{top:280,  right:-80,width:320,height:320,backgroundColor:"rgba(6,182,212,0.12)"}]}/>
      <View style={[s.orb,{bottom:60,left:-40, width:240,height:240,backgroundColor:"rgba(236,72,153,0.1)"}]}/>
    </View>
  );
}

function GCard({ children, title, accent="#7c3aed" }:
  { children: React.ReactNode; title?: string; accent?: string }) {
  return (
    <View style={[s.cw,{shadowColor:accent}]}>
      <BlurView intensity={55} tint="dark" style={s.card}>
        <View style={[s.ci,{borderColor:accent+"28"}]}>
          {title && <View style={s.tr}><View style={[s.tb,{backgroundColor:accent}]}/><Text style={s.tt}>{title}</Text></View>}
          {children}
        </View>
      </BlurView>
    </View>
  );
}

function Bar({ pct, colors }: { pct: number; colors: [string,string] }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: pct, useNativeDriver: false, tension: 35, friction: 9 }).start();
  }, [pct]);
  const w = a.interpolate({ inputRange:[0,100], outputRange:["0%","100%"] });
  return (
    <View style={s.bt}>
      <Animated.View style={[s.bf,{width:w}]}>
        <LinearGradient colors={colors} start={{x:0,y:0}} end={{x:1,y:0}} style={StyleSheet.absoluteFill}/>
      </Animated.View>
    </View>
  );
}

export default function ProfileScreen() {
  const { username, data, logout } = useUser();

  // Just call logout() — RootNavigator watches username and redirects automatically
  const handleLogout = () => { logout(); };

  const heatmap = data?.submissionCalendar ? buildHeatmap(data.submissionCalendar) : [];
  const maxLang = Math.max(...(data?.languages ?? []).map((l: LanguageStat) => l.solved), 1);

  if (!data) {
    return (
      <View style={s.container}>
        <AuroraBg/>
        <View style={s.center}><Text style={s.loading}>Loading profile...</Text></View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <AuroraBg/>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.hdr}>
          <View>
            <Text style={s.sub}>Signed in as</Text>
            <Text style={s.uname}>@{username}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={s.lb} activeOpacity={0.75}>
            <Text style={s.lt}>↩ Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <GCard accent="#7c3aed">
          <View style={s.strip}>
            {[
              {label:"Solved", val:String(data.solved), color:"#a78bfa"},
              {label:"Easy",   val:String(data.easy),   color:"#22c55e"},
              {label:"Medium", val:String(data.medium), color:"#facc15"},
              {label:"Hard",   val:String(data.hard),   color:"#ef4444"},
            ].map(({label,val,color},i,arr) => (
              <React.Fragment key={label}>
                <View style={s.sc}>
                  <Text style={[s.sv,{color}]}>{val}</Text>
                  <Text style={s.sl}>{label}</Text>
                </View>
                {i < arr.length-1 && <View style={s.sd}/>}
              </React.Fragment>
            ))}
          </View>
          <View style={s.br}>
            {data.streak > 0 && <View style={[s.badge,{borderColor:"rgba(251,146,60,0.4)",backgroundColor:"rgba(251,146,60,0.1)"}]}><Text style={[s.bt2,{color:"#fb923c"}]}>🔥 {data.streak}d streak</Text></View>}
            {data.ranking > 0 && <View style={[s.badge,{borderColor:"rgba(167,139,250,0.4)",backgroundColor:"rgba(167,139,250,0.1)"}]}><Text style={[s.bt2,{color:"#a78bfa"}]}>#{data.ranking.toLocaleString()}</Text></View>}
            {!!data.contestRating && <View style={[s.badge,{borderColor:"rgba(251,191,36,0.4)",backgroundColor:"rgba(251,191,36,0.1)"}]}><Text style={[s.bt2,{color:"#fbbf24"}]}>🏆 {data.contestRating}</Text></View>}
          </View>
        </GCard>

        {/* Languages */}
        {data.languages?.length > 0 && (
          <GCard title="Languages" accent="#0ea5e9">
            {data.languages.map((lang: LanguageStat) => {
              const pct = (lang.solved / maxLang) * 100;
              const color = LANG_COLOR[lang.name.toLowerCase()] ?? "#6b7280";
              return (
                <View key={lang.name} style={s.lr}>
                  <View style={s.lm}>
                    <View style={[s.ld,{backgroundColor:color}]}/>
                    <Text style={s.ln}>{lang.name}</Text>
                    <Text style={s.lc}>{lang.solved}</Text>
                  </View>
                  <Bar pct={pct} colors={[color, color+"77"]}/>
                </View>
              );
            })}
          </GCard>
        )}

        {/* Skills */}
        {data.skills && (data.skills.advanced.length > 0 || data.skills.intermediate.length > 0 || data.skills.fundamental.length > 0) && (
          <GCard title="Skills" accent="#ec4899">
            {(["advanced","intermediate","fundamental"] as const).map((level) => {
              const tags = data.skills[level];
              if (!tags?.length) return null;
              const maxS = Math.max(...tags.map((t: SkillTag) => t.solved), 1);
              const { bar } = SKILL_COLORS[level];
              return (
                <View key={level} style={s.sb2}>
                  <View style={s.sh}><View style={[s.sdt,{backgroundColor:bar[0]}]}/><Text style={[s.slv,{color:bar[0]}]}>{level.toUpperCase()}</Text></View>
                  {tags.slice(0,6).map((tag: SkillTag) => (
                    <View key={tag.name} style={s.sr}>
                      <View style={s.sm}><Text style={s.sn}>{tag.name}</Text><Text style={s.sk}>×{tag.solved}</Text></View>
                      <Bar pct={(tag.solved/maxS)*100} colors={bar}/>
                    </View>
                  ))}
                </View>
              );
            })}
          </GCard>
        )}

        {/* Heatmap */}
        <GCard title="Activity" accent="#22c55e">
          {heatmap.length === 0 ? <Text style={s.empty}>No activity data</Text> : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={s.hm}>
                  {heatmap.map((week,i) => (
                    <View key={i} style={s.hc}>
                      {week.map((day,j) => <View key={j} style={[s.hcell,{backgroundColor:heatColor(day.count)}]}/>)}
                    </View>
                  ))}
                </View>
              </ScrollView>
              <View style={s.leg}>
                <Text style={s.lgt}>Less</Text>
                {[0,2,5,9,15].map(v=><View key={v} style={[s.hcell,{backgroundColor:heatColor(v)}]}/>)}
                <Text style={s.lgt}>More</Text>
              </View>
            </>
          )}
        </GCard>

        {/* Recent */}
        {data.recentSubmissions?.length > 0 && (
          <GCard title="Recent Accepted" accent="#facc15">
            {data.recentSubmissions.map((sub: any, i: number) => (
              <View key={i} style={[s.row, i===data.recentSubmissions.length-1&&{borderBottomWidth:0}]}>
                <View style={{flex:1,marginRight:10}}>
                  <Text style={s.rtitle} numberOfLines={1}>{sub.title}</Text>
                  <Text style={s.rtime}>{timeSince(sub.timestamp)}</Text>
                </View>
                <View style={[s.pill,{backgroundColor:(LANG_COLOR[sub.lang]??"#374151")+"28",borderColor:LANG_COLOR[sub.lang]??"#374151"}]}>
                  <Text style={[s.pillT,{color:LANG_COLOR[sub.lang]??"#9ca3af"}]}>{sub.lang}</Text>
                </View>
              </View>
            ))}
          </GCard>
        )}

        <View style={{height:110}}/>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:"#04001a"},
  center:{flex:1,justifyContent:"center",alignItems:"center"},
  loading:{color:"#a78bfa",fontSize:15},
  scroll:{padding:16,paddingTop:62},
  orb:{position:"absolute",borderRadius:999},

  hdr:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:18},
  sub:{color:"rgba(255,255,255,0.38)",fontSize:12,letterSpacing:0.5},
  uname:{color:"#fff",fontSize:22,fontWeight:"800",letterSpacing:-0.3,marginTop:2},
  lb:{backgroundColor:"rgba(239,68,68,0.12)",paddingVertical:9,paddingHorizontal:16,borderRadius:22,borderWidth:1,borderColor:"rgba(239,68,68,0.28)"},
  lt:{color:"#f87171",fontWeight:"700",fontSize:13},

  cw:{marginBottom:14,borderRadius:22,overflow:"hidden",shadowOffset:{width:0,height:8},shadowOpacity:0.45,shadowRadius:22,elevation:10},
  card:{borderRadius:22},
  ci:{padding:18,borderWidth:1,borderRadius:22},
  tr:{flexDirection:"row",alignItems:"center",marginBottom:14},
  tb:{width:3,height:17,borderRadius:2,marginRight:9},
  tt:{color:"#fff",fontSize:15,fontWeight:"700",letterSpacing:0.2},

  strip:{flexDirection:"row",justifyContent:"space-around",paddingVertical:6,marginBottom:14},
  sc:{alignItems:"center"},
  sv:{fontSize:22,fontWeight:"800"},
  sl:{color:"rgba(255,255,255,0.35)",fontSize:11,marginTop:3},
  sd:{width:1,backgroundColor:"rgba(255,255,255,0.08)",marginHorizontal:4},

  br:{flexDirection:"row",flexWrap:"wrap",gap:8,borderTopWidth:1,borderTopColor:"rgba(255,255,255,0.07)",paddingTop:12},
  badge:{paddingHorizontal:11,paddingVertical:5,borderRadius:20,borderWidth:1},
  bt2:{fontSize:12,fontWeight:"600"},

  lr:{marginBottom:13},
  lm:{flexDirection:"row",alignItems:"center",marginBottom:5},
  ld:{width:8,height:8,borderRadius:4,marginRight:8},
  ln:{color:"#e2e8f0",fontSize:13,fontWeight:"600",flex:1},
  lc:{color:"rgba(255,255,255,0.38)",fontSize:12},

  bt:{height:6,backgroundColor:"rgba(255,255,255,0.07)",borderRadius:6,overflow:"hidden"},
  bf:{height:"100%",borderRadius:6,overflow:"hidden"},

  sb2:{marginBottom:16},
  sh:{flexDirection:"row",alignItems:"center",marginBottom:9},
  sdt:{width:6,height:6,borderRadius:3,marginRight:8},
  slv:{fontSize:11,fontWeight:"700",letterSpacing:1.2},
  sr:{marginBottom:9},
  sm:{flexDirection:"row",justifyContent:"space-between",marginBottom:4},
  sn:{color:"#e2e8f0",fontSize:13},
  sk:{color:"rgba(255,255,255,0.38)",fontSize:12},

  hm:{flexDirection:"row",gap:3,paddingVertical:4},
  hc:{flexDirection:"column",gap:3},
  hcell:{width:10,height:10,borderRadius:2},
  leg:{flexDirection:"row",alignItems:"center",gap:4,marginTop:8},
  lgt:{color:"rgba(255,255,255,0.28)",fontSize:11},
  empty:{color:"rgba(255,255,255,0.28)",fontSize:13},

  row:{flexDirection:"row",alignItems:"center",paddingVertical:10,borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,0.05)"},
  rtitle:{color:"#e2e8f0",fontSize:13,fontWeight:"600"},
  rtime:{color:"rgba(255,255,255,0.32)",fontSize:11,marginTop:2},
  pill:{paddingHorizontal:8,paddingVertical:3,borderRadius:8,borderWidth:1},
  pillT:{fontSize:11,fontWeight:"700"},
});
