import { getAuthToken, getFname, getLname, getUsername, isTokenExpired } from "@/lib/utils/authUtils";
import { getUserRole } from "@/lib/utils/jwt";
import { IRootState } from "@/store/api";
import { setAuth } from "@/store/api/slices/authSlice";
import { Tabs, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";


export default function TeacherLayout() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme.colorScheme === 'dark';
  const dispatch = useDispatch();
  const [rehydrated, setRehydrated] = useState(false);
  const firstName = useSelector((state: IRootState) => state.auth.fname);
  const lastName = useSelector((state: IRootState) => state.auth.lname);
  const isDark = colorScheme.colorScheme === "dark";


  useEffect(() => {
    (async () => {
      const role = await getUserRole();
      if (role === "teacher") {
        setAllowed(true);
      } else {
        router.replace("/unauthorized");
      }
    })();
  }, []);

  useEffect(() => {
    const loadFromSecureStore = async () => {
      if (!firstName || !lastName) {
        const [fname, lname, username, role] = await Promise.all([
          getFname(),
          getLname(),
          getUsername(),
          getUserRole(),
        ]);

        dispatch(setAuth({
          fname: fname ?? "",
          lname: lname ?? "",
          username: username ?? "",
          role: role ?? ""
        }));
      }
      setRehydrated(true);
    };

    loadFromSecureStore();
  }, []);


  if (allowed === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc" }}>
        <ActivityIndicator size="large" color={isDarkMode ? "#60a5fa" : "#3b82f6"} />
      </View>
    );
  }

 
  if (!rehydrated) {
    // You can show a splash screen or just a loader
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#3b82f6"} />
      </View>
    );
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Subeject List",
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
      />
      <Tabs.Screen name="[id]/subjectList" options={{ 
        title: "Subject",
        headerShown: false,
          tabBarStyle: {
            display: "none",
          },
           }} />
           <Tabs.Screen name="[id]/[termId]/camera" options={{ 
        title: "Subject",
        headerShown: false,
          tabBarStyle: {
            display: "none",
          },
           }} />
    </Tabs>
  );
}

