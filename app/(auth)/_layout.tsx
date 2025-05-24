import React, { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {  Tabs, useRouter } from 'expo-router';


import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { getAuthToken, isTokenExpired } from '@/lib/utils/authUtils';
import { getUserRole } from '@/lib/utils/jwt';


// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getAuthToken();
      if (token && !isTokenExpired(token)) {
        const role = await getUserRole();
        switch (role) {
          case "student":
            router.replace("/(protected)/(student)/dashboard");
            break;
          case "teacher":
            router.replace("/(protected)/(teacher)/dashboard");
            break;
          default:
            router.replace("/unauthorized");
        }
        return; // prevent further render
      }
      setChecking(false); // no valid token, show login/register
    })();
  }, []);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerShown: false,
          tabBarStyle: {
            display: 'none',
          },
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: 'Register',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerShown: false,
          tabBarStyle: {
            display: 'none',
          },
          
        }}
      />
    </Tabs>
  );
}
