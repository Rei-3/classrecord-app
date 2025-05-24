import { useEffect, useState } from "react";
import { getUserRole } from "@/lib/utils/jwt";
import { Tabs, useRouter } from "expo-router";
import { ActivityIndicator, View, useColorScheme } from "react-native";
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { getFname, getLname, getUsername, removeAuthToken } from "@/lib/utils/authUtils";
import { IRootState } from "@/store/api";
import { setAuth } from "@/store/api/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";

export default function StudentLayout() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const dispatch = useDispatch();
  const [rehydrated, setRehydrated] = useState(false);
  const firstName = useSelector((state: IRootState) => state.auth.fname);
  const lastName = useSelector((state: IRootState) => state.auth.lname);
  const isDark = colorScheme === "dark";


  useEffect(() => {
    (async () => {
      const role = await getUserRole();
      if (role === "student") {
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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkMode ? "#60a5fa" : "#2563eb",
        tabBarInactiveTintColor: isDarkMode ? "#9ca3af" : "#94a3b8",
        tabBarStyle: {
          backgroundColor: isDarkMode ? "#111827" : "#ffffff",
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: isDarkMode ? "#000" : "#aaa",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Subjects",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="qrcode" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="[id]/grade"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="[tld]/[term]/[cat]/scores"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
          tabBarLabel: "Profile",
          href: "/profile",
        }}
      />
    </Tabs>
  );
}
