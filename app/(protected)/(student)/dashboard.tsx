import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  RefreshControl,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  ColorValue,
  StyleSheet
} from "react-native";
import { useState, useRef, useEffect, useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { IRootState } from "@/store/api";
import { useGetSubjectsEnrolledQuery } from "@/store/api/apiSlice/getApi/student/subjectsEnrolledApiSlice";
import { router } from "expo-router";
import { getFname, getLname, getUsername } from "@/lib/utils/authUtils";
import { setAuth } from "@/store/api/slices/authSlice";

interface SubjectsEnrolled {
  teachingLoadDetailId: number;
  subjectDesc: string;
  subjectName: string;
  status: boolean;
  academicYear: string;
  semName: string;
  teacher: string;
  section: string;
  schedule: string;
}

export default function StudentDashboard() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"1stSem" | "2ndSem" | "summer">("1stSem");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [viewAllMode, setViewAllMode] = useState(false);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(
    (state: IRootState) => state.auth.isAuthenticated
  );
  const { data: subjectsEnrolled = [], refetch } = useGetSubjectsEnrolledQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
  });
  const firstName = useSelector((state: IRootState) => state.auth.fname);
  const lastName = useSelector((state: IRootState) => state.auth.lname);

  // Helper function to get semester order for sorting
  const getSemesterOrder = (semName: string): number => {
    const sem = semName?.toLowerCase() || "";
    if (sem.includes("summer")) return 3;
    if (sem.includes("second") || sem.includes("2nd")) return 2;
    if (sem.includes("first") || sem.includes("1st")) return 1;
    return 0; // Unknown semester
  };

  // Helper function to sort subjects by time (latest first)
  const sortSubjectsByTime = (subjects: SubjectsEnrolled[]): SubjectsEnrolled[] => {
    return [...subjects].sort((a, b) => {
      // First, sort by academic year (descending - latest year first)
      const yearA = a.academicYear || "";
      const yearB = b.academicYear || "";
      
      if (yearA !== yearB) {
        return yearB.localeCompare(yearA);
      }
      
      // If same year, sort by semester (descending - summer > 2nd > 1st)
      const semOrderA = getSemesterOrder(a.semName);
      const semOrderB = getSemesterOrder(b.semName);
      
      if (semOrderA !== semOrderB) {
        return semOrderB - semOrderA;
      }
      
      // If same year and semester, sort by subject name for consistency
      return (a.subjectName || "").localeCompare(b.subjectName || "");
    });
  };

  // Get unique academic years from subjects (sorted descending)
  const academicYears = [...new Set(subjectsEnrolled.map(subject => subject.academicYear))]
    .sort((a, b) => b.localeCompare(a));

  // Calculate filtered and sorted subjects
  const filteredSubjects = useMemo(() => {
    let filtered = [...subjectsEnrolled];
    
    if (!viewAllMode) {
      if (activeTab === "1stSem") {
        filtered = filtered.filter(subject => 
          subject.semName?.toLowerCase().includes("first") || 
          subject.semName?.includes("1st")
        );
      } else if (activeTab === "2ndSem") {
        filtered = filtered.filter(subject => 
          subject.semName?.toLowerCase().includes("second") || 
          subject.semName?.includes("2nd")
        );
      } else if (activeTab === "summer") {
        filtered = filtered.filter(subject => 
          subject.semName?.toLowerCase().includes("summer")
        );
      }
    }
    
    if (selectedYear !== "All Years") {
      filtered = filtered.filter(subject => subject.academicYear === selectedYear);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(subject => 
        subject.subjectName?.toLowerCase().includes(query) ||
        subject.subjectDesc?.toLowerCase().includes(query) ||
        subject.teacher?.toLowerCase().includes(query) ||
        subject.section?.toLowerCase().includes(query)
      );
    }
    
    // Sort by time (latest first)
    return sortSubjectsByTime(filtered);
  }, [activeTab, searchQuery, subjectsEnrolled, selectedYear, viewAllMode]);

  const activeSubjectsCount = subjectsEnrolled.filter(subject => subject.status).length;

  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [75, 0],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [0, -60],
    extrapolate: "clamp",
  });

  const backgroundColors: [ColorValue, ColorValue] = isDark
    ? ["#0f172a", "#1e293b"]
    : ["#f8fafc", "#e2e8f0"];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const renderSubjectCard = (subject: SubjectsEnrolled) => {
    const subjectColors = [
      ["#1e40af", "#3b82f6"], // Blue gradient
      ["#7e22ce", "#a855f7"], // Purple gradient
      ["#15803d", "#22c55e"], // Green gradient
      ["#b45309", "#f59e0b"], // Orange gradient
      ["#be185d", "#ec4899"], // Pink gradient
      ["#b91c1c", "#ef4444"], // Red gradient
    ];
    
    const colorIndex = subject.teachingLoadDetailId % 6;
    const gradientColors = subjectColors[colorIndex] as [ColorValue, ColorValue];

    return (
      <TouchableOpacity
        key={subject.teachingLoadDetailId}
        className={`${
          isDark ? "bg-gray-800" : "bg-white"
        } rounded-lg mb-4 shadow-sm overflow-hidden border ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
        activeOpacity={0.9}
        onPress={() => router.push(`/${subject.teachingLoadDetailId}/grade`)}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-1.5 w-full"
        />
        <View className="p-4">
          <View className="flex-row items-start mb-3">
            <View
              className={`h-10 w-10 rounded-md items-center justify-center mr-3`}
              style={{ backgroundColor: gradientColors[0] }}
            >
              <Text className="text-white font-bold text-sm text-center">
                {subject.subjectDesc?.substring(0, 15).toUpperCase()}
              </Text>
            </View>

            <View className="flex-1">
              <View className="flex-row justify-between items-start">
                <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1">
                  {subject.subjectName}
                </Text>
                <View className={`px-2 py-1 rounded-md ${
                  subject.status ? 
                    "bg-green-50 border border-green-100 dark:bg-green-900/30 dark:border-green-800" : 
                    "bg-gray-50 border border-gray-100 dark:bg-gray-700/30 dark:border-gray-600"
                }`}>
                  <Text className={`text-xs ${
                    subject.status ? 
                      "text-green-700 dark:text-green-300" : 
                      "text-gray-500 dark:text-gray-400"
                  }`}>
                    {subject.status ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {subject.teacher || "Teacher: Not assigned"}
              </Text>
            </View>
            
            <MaterialIcons 
              name="chevron-right" 
              size={20} 
              color={isDark ? "#9ca3af" : "#6b7280"} 
            />
          </View>

          <View className="flex-row flex-wrap mb-2">
            <View className={`px-2.5 py-1 rounded-md mr-2 mb-2 ${
              isDark ? "bg-gray-700/50" : "bg-gray-100"
            }`}>
              <Text className="text-xs text-gray-600 dark:text-gray-300">
                {subject.semName || "Semester: N/A"}
              </Text>
            </View>
            <View className={`px-2.5 py-1 rounded-md mr-2 mb-2 ${
              isDark ? "bg-gray-700/50" : "bg-gray-100"
            }`}>
              <Text className="text-xs text-gray-600 dark:text-gray-300">
                {subject.academicYear || "AY: N/A"}
              </Text>
            </View>
            <View className={`px-2.5 py-1 rounded-md mb-2 ${
              isDark ? "bg-gray-700/50" : "bg-gray-100"
            }`}>
              <Text className="text-xs text-gray-600 dark:text-gray-300">
                {subject.section ? `Sec: ${subject.section}` : "Section: N/A"}
              </Text>
            </View>
          </View>

          {subject.schedule && (
            <View className="flex-row items-center">
              <MaterialIcons
                name="schedule"
                size={14}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">
                {subject.schedule}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1">
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient
        colors={backgroundColors}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View className="pt-14 px-6 pb-2 z-10">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Welcome back,
              </Text>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white">
                {firstName} {lastName}
              </Text>
            </View>
            <TouchableOpacity
              className="h-10 w-10 rounded-full items-center justify-center bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-800"
              onPress={toggleColorScheme}
            >
              <MaterialIcons 
                name={isDark ? "light-mode" : "dark-mode"} 
                size={18} 
                color={isDark ? "#e5e7eb" : "#4b5563"} 
              />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View className={`${
            isDark ? "bg-gray-800" : "bg-white"
          } rounded-lg flex-row items-center px-3 py-2 mb-4 shadow-sm border ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}>
            <Feather name="search" size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
            <TextInput
              className="flex-1 ml-2 text-sm text-gray-900 dark:text-white"
              placeholder="Search subjects or teachers..."
              placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Collapsible Stats Section */}
        <Animated.View
          style={{
            height: headerHeight,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          }}
          className="overflow-hidden px-6"
        >
          <View
            className={`${
              isDark ? "bg-gray-800" : "bg-white"
            } rounded-lg p-4 shadow-sm border ${
              isDark ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <View className="flex-row justify-between">
              <View className="flex-1 items-center">
                <Text className="text-xl font-semibold text-gray-900 dark:text-white">
                  {activeSubjectsCount}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Active
                </Text>
              </View>
              <View className="w-px h-10 bg-gray-200 dark:bg-gray-700 mx-2" />
              <View className="flex-1 items-center">
                <Text className="text-xl font-semibold text-blue-500 dark:text-blue-400">
                  {subjectsEnrolled.length}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  All
                </Text>
              </View>
              <View className="w-px h-10 bg-gray-200 dark:bg-gray-700 mx-2" />
              <View className="flex-1 items-center">
                <Text className="text-xl font-semibold text-green-500 dark:text-green-400">
                  {filteredSubjects.length}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {viewAllMode ? "All" : activeTab === "1stSem" ? "1st" : activeTab === "2ndSem" ? "2nd" : "Summer"}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Main Content */}
        <Animated.ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? "#FFFFFF" : "#2563eb"}
              colors={["#2563eb", "#10b981"]}
              progressBackgroundColor={isDark ? "#1e293b" : "#f8fafc"}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Filters Row */}
          <View className="flex-row justify-between items-center mb-4">
            {/* Academic Year Picker */}
            <TouchableOpacity 
              className={`flex-row items-center px-3 py-2 rounded-lg ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-sm border ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
              onPress={() => setShowYearPicker(true)}
            >
              <Text className="text-sm text-gray-900 dark:text-white mr-2">
                {selectedYear}
              </Text>
              <MaterialIcons 
                name="arrow-drop-down" 
                size={16} 
                color={isDark ? "#9ca3af" : "#6b7280"} 
              />
            </TouchableOpacity>

            {/* View All Toggle */}
            <TouchableOpacity
              className={`flex-row items-center px-3 py-2 rounded-lg ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-sm border ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
              onPress={() => setViewAllMode(!viewAllMode)}
            >
              <Text className="text-sm text-gray-900 dark:text-white mr-2">
                {viewAllMode ? "Filter by Sem" : "View All"}
              </Text>
              <MaterialIcons 
                name={viewAllMode ? "filter-alt" : "view-agenda"} 
                size={16} 
                color={isDark ? "#9ca3af" : "#6b7280"} 
              />
            </TouchableOpacity>
          </View>

          {/* Semester Tabs (only shown when not in view all mode) */}
          {!viewAllMode && (
            <View
              className={`flex-row mb-5 rounded-lg p-1 ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-sm border ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              {["1stSem", "2ndSem", "summer"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  className={`flex-1 py-2 rounded-md items-center ${
                    activeTab === tab
                      ? isDark
                        ? "bg-gray-700"
                        : "bg-gray-100"
                      : ""
                  }`}
                  onPress={() => setActiveTab(tab as "1stSem" | "2ndSem" | "summer")}
                >
                  <Text
                    className={`text-sm font-medium ${
                      activeTab === tab
                        ? "text-blue-500 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {tab === "1stSem" ? "1st Sem" : tab === "2ndSem" ? "2nd Sem" : "Summer"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Content */}
          {filteredSubjects.length > 0 ? (
            <View className="pb-4">
              {filteredSubjects.map(renderSubjectCard)}
            </View>
          ) : (
            <View className="items-center justify-center py-12">
              <MaterialIcons 
                name="folder-off" 
                size={40} 
                color={isDark ? "#4b5563" : "#9ca3af"} 
              />
              <Text className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center px-8">
                {searchQuery 
                  ? "No matching subjects found" 
                  : viewAllMode
                    ? "No subjects for selected year"
                    : `No subjects in ${activeTab === "1stSem" ? "1st Sem" : activeTab === "2ndSem" ? "2nd Sem" : "Summer"}`}
              </Text>
            </View>
          )}

          {/* Bottom spacing */}
          <View className="h-6" />
        </Animated.ScrollView>
      </LinearGradient>

      {/* Academic Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowYearPicker(false)}
        >
          <View 
            className={`w-4/5 rounded-lg p-4 ${
              isDark ? "bg-gray-800" : "bg-white"
            } border ${
              isDark ? "border-gray-800" : "border-gray-200"
            }`}
            onStartShouldSetResponder={() => true}
          >
            <Text className="text-base font-semibold mb-4 text-gray-900 dark:text-white">
              Select Academic Year
            </Text>
            <ScrollView className="max-h-64">
              <TouchableOpacity
                className={`py-2.5 px-4 rounded-md mb-2 ${
                  selectedYear === "All Years" 
                    ? "bg-blue-50 border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800" 
                    : isDark ? "bg-gray-700/50 border border-gray-600" : "bg-gray-50 border border-gray-200"
                }`}
                onPress={() => {
                  setSelectedYear("All Years");
                  setShowYearPicker(false);
                }}
              >
                <Text 
                  className={`text-sm ${
                    selectedYear === "All Years" 
                      ? "text-blue-600 dark:text-blue-300" 
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  All Years
                </Text>
              </TouchableOpacity>
              {academicYears.map(year => (
                <TouchableOpacity
                  key={year}
                  className={`py-2.5 px-4 rounded-md mb-2 ${
                    selectedYear === year 
                      ? "bg-blue-50 border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800" 
                      : isDark ? "bg-gray-700/50 border border-gray-600" : "bg-gray-50 border border-gray-200"
                  }`}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  }}
                >
                  <Text 
                    className={`text-sm ${
                      selectedYear === year 
                        ? "text-blue-600 dark:text-blue-300" 
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}