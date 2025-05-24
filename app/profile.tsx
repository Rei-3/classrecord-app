import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { router, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "@/store/api/slices/authSlice";
import { removeAuthToken, removeCred } from "@/lib/utils/authUtils";
import { IRootState } from "@/store/api";
import { useGetStudentInfoQuery } from "@/store/api/apiSlice/getApi/student/subjectsEnrolledApiSlice";
import { useGetTeacherInfoQuery } from "@/store/api/apiSlice/getApi/teacher/teachingLoadApiSlice";

export default function EnterpriseProfileScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { tld, term, cat } = useLocalSearchParams();
  const dispatch = useDispatch();

  const firstName = useSelector((state: IRootState) => state.auth.fname);
  const lastName = useSelector((state: IRootState) => state.auth.lname);
  const username = useSelector((state: IRootState) => state.auth.username);
  const role = useSelector((state: IRootState) => state.auth.role);

  // Fetch user data based on role
  const { data: studentInfo } = useGetStudentInfoQuery(undefined, { skip: role !== "student" });
  const { data: teacherInfo } = useGetTeacherInfoQuery(undefined, { skip: role !== "teacher" });

  return (
    <ScrollView className={`${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Back Button */}
      <View className="absolute top-9 ml-3 mt-6 left-9 flex-row items-center z-10">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <MaterialIcons name="arrow-back" size={24} color={isDark ? "white" : "black"} />
          <Text className={`ml-2 text-lg ${isDark ? "text-white" : "text-gray-900"}`}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View className={`items-center pt-20 py-8 px-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow`}>
        <Image source={{ uri: studentInfo?.avatar || teacherInfo?.avatar || "https://i.pinimg.com/736x/1f/c7/3b/1fc73bfef2d3515b35cca7c8f74dec03.jpg" }} 
               className="w-28 h-28 rounded-full border-4 border-blue-500" />
        <Text className={`text-xl font-bold mt-4 ${isDark ? "text-white" : "text-gray-900"}`}>
          {firstName} {lastName}
        </Text>
        <Text className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          {role} | {studentInfo?.course || teacherInfo?.teacherId || "Unknown"}
        </Text>
        <View className="flex-row items-center mt-2">
          <MaterialIcons name="verified" size={16} color={isDark ? "#60a5fa" : "#3b82f6"} />
          <Text className={`ml-1 text-xs ${isDark ? "text-blue-400" : "text-blue-600"}`}>
            ID: @{username}
          </Text>
        </View>
      </View>

      {/* Personal Info */}
      <CardSection title="Personal Info" icon="person" isDark={isDark}>
        {role === "teacher"&&(
            <InfoRow icon="account-circle" label="Username" value={username || "N/A"} isDark={isDark} />
        )}
        <InfoRow icon="mail" label="Email" value={studentInfo?.email || teacherInfo?.email || "N/A"} isDark={isDark} />
        <InfoRow icon="male" label="Sex" value={role === "student" ? (studentInfo?.gender === "Male" ? "Female" : "Male") : teacherInfo?.gender ? (teacherInfo.gender === "Male" ?  "Female" : "Male") : "N/A"} isDark={isDark} />
        <InfoRow icon="cake" label="Birthday" value={studentInfo?.dob || teacherInfo?.dob || "N/A"} isDark={isDark} />
        {role === "student" && (
          <InfoRow icon="assignment-ind" label="School ID" value={username || "N/A"} isDark={isDark} />
        )}
      </CardSection>

      {/* Account Actions */}
      <CardSection title="Account Actions" icon="settings" isDark={isDark}>
        <ActionButton icon="lock" label="Change Password" onPress={() => console.log("Change Password")} isDark={isDark} />
        <ActionButton icon="help" label="Support Center" onPress={() => console.log("Support")} isDark={isDark} />
        <ActionButton icon="logout" label="Sign Out" onPress={() => {
          removeCred();
          removeAuthToken();
          dispatch(clearAuth());
          router.replace("/login");
        }} isDark={isDark} isLast />
      </CardSection>
    </ScrollView>
  );
}

// ------------------ Components ------------------

import { ReactNode } from "react";

import { MaterialIcons as MaterialIconsType } from "@expo/vector-icons";

const CardSection = ({ title, icon, isDark, children }: { title: string; icon: keyof typeof MaterialIconsType.glyphMap; isDark: boolean; children: ReactNode }) => (
  <View className={`mt-4 mx-4 rounded-xl p-4 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm`}>
    <View className="flex-row items-center mb-3">
      <MaterialIcons name={icon} size={20} color={isDark ? "#93c5fd" : "#3b82f6"} />
      <Text className={`ml-2 text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{title}</Text>
    </View>
    {children}
  </View>
);

const InfoRow = ({ icon, label, value, isDark }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string; isDark: boolean }) => (
  <View className="flex-row items-center py-3 border-b border-gray-200 dark:border-gray-700">
    <MaterialIcons name={icon} size={18} color={isDark ? "#9ca3af" : "#6b7280"} />
    <Text className={`ml-3 w-24 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{label}</Text>
    <Text className={`flex-1 ${isDark ? "text-white" : "text-gray-900"}`}>{value}</Text>
  </View>
);

const ActionButton = ({ icon, label, onPress, isDark, isLast = false }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; onPress: () => void; isDark: boolean; isLast?: boolean }) => (
  <TouchableOpacity className={`py-4 ${!isLast ? "border-b border-gray-200 dark:border-gray-700" : ""}`} onPress={onPress}>
    <View className="flex-row items-center">
      <MaterialIcons name={icon} size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
      <Text className={`ml-3 ${isDark ? "text-white" : "text-gray-900"}`}>{label}</Text>
      <View className="ml-auto">
        <MaterialIcons name="chevron-right" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
      </View>
    </View>
  </TouchableOpacity>
);
