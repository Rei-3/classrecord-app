
import { getAuthToken, isTokenExpired } from "@/lib/utils/authUtils";
import { getUserRole } from "@/lib/utils/jwt";
import { Stack, useRouter } from "expo-router";
import { useState, useEffect } from "react";



export default function ProtectedLayout() {
  // const router = useRouter();
  // const [checking, setChecking] = useState(true);

  // useEffect(() => {
  //   (async () => {
  //     const token = await getAuthToken();

  //     if (!token || isTokenExpired(token)) {
  //       router.replace("/(auth)/login");
  //       return;
  //     }
  //     const role = await getUserRole(); // e.g. 'student', 'teacher', or 'admin'
      
  //     switch (role) {
  //       case "student":
  //         router.replace("/(protected)/(student)/dashboard");
  //         break;
  //       case "teacher":
  //         router.replace("/(protected)/(teacher)/dashboard");
  //         break;
  //       case "admin":
  //         router.replace("/(protected)/(admin)/dashboard");
  //         break;
  //       default:
  //         router.replace("/unauthorized");
  //     }

  //     setChecking(false);
  //   })();
  // }, []);

  // if (checking) return null;


  return (
    <Stack>
      <Stack.Screen name="(student)" options={{ headerShown: false }} />
      <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
      {/* <Stack.Screen name="(admin)" options={{ headerShown: false }} /> */}
    </Stack>
  );
}
