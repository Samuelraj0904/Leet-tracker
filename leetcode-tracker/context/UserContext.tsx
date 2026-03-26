// context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchLeetCode, LeetCodeData } from "../utils/fetchLeetCode";

type Ctx = {
  username: string;
  data: LeetCodeData | null;
  loading: boolean;
  authLoading: boolean;
  error: string;
  login:   (user: string) => Promise<boolean>;
  logout:  () => Promise<void>;
  refetch: () => void;
};

const UserContext = createContext<Ctx>({
  username: "", data: null, loading: false,
  authLoading: true, error: "",
  login: async () => false,
  logout: async () => {},
  refetch: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [username,    setUsername]    = useState("");
  const [data,        setData]        = useState<LeetCodeData | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error,       setError]       = useState("");

  // On mount — check AsyncStorage for saved username
  useEffect(() => {
    AsyncStorage.getItem("leet_username")
      .then((saved) => {
        if (saved?.trim()) {
          setUsername(saved.trim());
          loadData(saved.trim());
        }
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const loadData = (user: string) => {
    setLoading(true);
    setError("");
    fetchLeetCode(user)
      .then((res) => { if (!res) setError("User not found"); else setData(res); })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  };

  const login = async (user: string): Promise<boolean> => {
    setError("");
    try {
      const res  = await fetch(`http://localhost:3000/${user}`);
      const json = await res.json();
      if (!json || json.errors || !json.username) {
        setError("User not found. Check the username.");
        return false;
      }
      await AsyncStorage.setItem("leet_username", user);
      setUsername(user);   // ← RootNavigator sees username → redirects to /(tabs)
      loadData(user);
      return true;
    } catch {
      setError("Could not reach server. Make sure it's running.");
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("leet_username");
    setData(null);
    setError("");
    setUsername("");  // ← RootNavigator sees username="" → redirects to /welcome
  };

  return (
    <UserContext.Provider value={{
      username, data, loading, authLoading, error,
      login, logout, refetch: () => loadData(username),
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
