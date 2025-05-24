import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  Pressable,
  RefreshControl,
  Modal,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { useGetTeachingLoadQuery } from "@/store/api/apiSlice/getApi/teacher/teachingLoadApiSlice";
import { useGetSemQuery } from "@/store/api/apiSlice/getApi/courseApiSlice";

interface SubjectDisplayInfo {
  id: string;
  code: string;
  name: string;
  schedule: string;
  section: string;
  status?: string;
  semester: string;
  semId: number;
  createdAt?: string;
  academicYear: string;
  isActive: boolean;
}

export default function TeacherSubjectsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollY = useRef(new Animated.Value(0)).current;

  const [allSubjectsFromApi, setAllSubjectsFromApi] = useState<SubjectDisplayInfo[]>([]);

  const {
    data: teachingLoad,
    isLoading: isLoadingApi,
    error: apiError,
    refetch,
  } = useGetTeachingLoadQuery();

  const { data: semesterData, isLoading: isLoadingSemesters } = useGetSemQuery();

  useEffect(() => {
    if (teachingLoad && semesterData) {
      const transformedSubjects: SubjectDisplayInfo[] = [];
      
      teachingLoad.forEach((academicTerm) => {
        const matchingSemester = semesterData.find(
          (sem) => sem.id === academicTerm.semId
        );
        
        const semesterName = matchingSemester ? matchingSemester.semName : "Unknown Semester";
        const semIdForSubject = academicTerm.semId || 0;
        const isActive = typeof academicTerm.status === 'boolean' 
          ? academicTerm.status 
          : academicTerm.status === 'Active';

        if (academicTerm.teachingLoadId) {
          academicTerm.teachingLoadId.forEach((loadDetail) => {
            if (loadDetail.subjects) {
              transformedSubjects.push({
                id: loadDetail.id.toString(),
                code: loadDetail.subjects.subjectDesc || loadDetail.subjects.subjectDesc || "N/A",
                name: loadDetail.subjects.subjectName || "Unknown Subject",
                schedule: loadDetail.schedule || "TBA",
                section: loadDetail.section || "N/A",
                status: isActive ? "Active" : "Inactive",
                semester: semesterName,
                semId: semIdForSubject,
                createdAt: academicTerm.addedOn || new Date().toISOString(),
                academicYear: academicTerm.academicYear || new Date().getFullYear().toString(),
                isActive
              });
            }
          });
        }
      });
      
      const sortedSubjects = transformedSubjects.sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return a.isActive ? -1 : 1;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      
      setAllSubjectsFromApi(sortedSubjects);
    } else {
      setAllSubjectsFromApi([]);
    }
  }, [teachingLoad, semesterData]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const ANIMATED_CONTENT_INITIAL_HEIGHT = 195; // Increased height to accommodate both filters
  const SCROLL_DISTANCE_FOR_ANIMATION = 150;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE_FOR_ANIMATION],
    outputRange: [ANIMATED_CONTENT_INITIAL_HEIGHT, 105],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE_FOR_ANIMATION * 0.6, SCROLL_DISTANCE_FOR_ANIMATION],
    outputRange: [1, 0.8, 0.8],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE_FOR_ANIMATION],
    outputRange: [0, -5],
    extrapolate: "clamp",
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 600,
        useNativeDriver: true 
      }),
      Animated.timing(slideAnim, { 
        toValue: 0, 
        duration: 600, 
        useNativeDriver: true 
      }),
    ]).start();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch().unwrap();
    } catch (err) {
      console.error("Failed to refetch teaching load:", err);
    }
    setRefreshing(false);
  }, [refetch]);

  // Get unique academic years from subjects
  const academicYears = useMemo(() => {
    const years = new Set<string>();
    allSubjectsFromApi.forEach(subject => {
      if (subject.academicYear) {
        years.add(subject.academicYear);
      }
    });
    return ["All Years", ...Array.from(years).sort((a, b) => b.localeCompare(a))];
  }, [allSubjectsFromApi]);

  const semesters = useMemo(() => {
    if (!semesterData || !Array.isArray(semesterData) || semesterData.length === 0) {
      return ["All Semesters"];
    }
    const sortedSemesters = [...semesterData].sort((a, b) => b.id - a.id);
    return ["All Semesters", ...sortedSemesters.map(sem => sem.semName)];
  }, [semesterData]);

  const filteredSubjects = useMemo(() => {
    return allSubjectsFromApi.filter((subject) => {
      const matchesSemester = 
        selectedSemester === "All Semesters" || subject.semester === selectedSemester;
      const matchesYear = 
        selectedYear === "All Years" || subject.academicYear === selectedYear;
      const matchesSearch =
        searchQuery === "" ||
        (subject.name && subject.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (subject.code && subject.code.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesSemester && matchesYear && matchesSearch;
    }).sort((a, b) => {
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [allSubjectsFromApi, selectedSemester, selectedYear, searchQuery]);

  const backgroundColors: [string, string, string] = isDark
    ? ["#1a1c2e", "#2d3250", "#1a1c2e"]
    : ["#f0f5ff", "#e6f0ff", "#f0f5ff"];

  const renderSubjectItem = ({ item }: { item: SubjectDisplayInfo }) => (
    <Pressable
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 ${
        Platform.OS === "ios" ? "shadow-sm" : "shadow"
      } ${item.isActive ? "border-l-4 border-blue-500" : ""}`}
      android_ripple={{ color: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", borderless: false }}
      onPress={() => router.push(`/${item.id}/subjectList`)}
    >
      {item.isActive && (
        <View className="absolute top-2 right-2 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
          <Text className="text-xs text-green-800 dark:text-green-200">Active</Text>
        </View>
      )}
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center flex-1">
          <View
            className={`h-10 w-10 rounded-lg items-center justify-center ${
              ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500", "bg-red-500", "bg-teal-500"][
                parseInt(item.id) % 7
              ]
            }`}
          >
            <Text className="text-white font-bold text-xs text-center">
              {(item.code && item.code !== 'N/A' && item.code.length >= 2) ? item.code.substring(0, 7).toUpperCase() : 'SUB'}
            </Text>
          </View>
          <View className="ml-3 flex-1">
            <Text numberOfLines={1} ellipsizeMode="tail" className="text-sm text-gray-500 dark:text-gray-400">{item.code}</Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="text-base font-bold text-gray-900 dark:text-white">{item.name}</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={isDark ? "#9ca3af" : "#6b7280"} />
      </View>
      <View className="flex-row justify-between items-center mb-3 mt-1">
        <View className="flex-row items-center">
          <MaterialIcons name="event" size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
          <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">{item.status}</Text>
        </View>
        <View className="flex-row items-center">
          <MaterialIcons name="access-time" size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
          <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">{item.schedule}</Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <MaterialIcons name="table-rows" size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
          <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">Section: {item.section}</Text>
        </View>
        <View className="flex-row items-center">
          <MaterialIcons name="calendar-today" size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
          <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            {item.academicYear} : {item.semester}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1">
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Fixed Header */}
      <View className={`pt-12 px-4 pb-2 flex-row justify-between items-center ${Platform.OS === "android" ? "mt-0" : ""}`}>
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">My Subjects</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">Current Academic Year</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="h-10 w-10 rounded-full items-center justify-center mr-2 bg-white dark:bg-gray-700 shadow-sm">
            <MaterialIcons name="notifications" size={22} color={isDark ? "#e5e7eb" : "#4b5563"} />
          </TouchableOpacity>
          <TouchableOpacity 
            className="h-10 w-10 rounded-full items-center justify-center bg-white dark:bg-gray-700 shadow-sm"
            onPress={() => router.push("/profile")}
          >
            <MaterialIcons name="person" size={22} color={isDark ? "#e5e7eb" : "#4b5563"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter Section */}
      <Animated.View 
        style={{ 
          height: headerHeight,
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }]
        }}
        className="px-4 overflow-hidden"
      >
        {/* Search Bar */}
        <View className="pb-2">
          <View className={`flex-row items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-1 border ${
            isDark ? "border-gray-700" : "border-gray-200"
          } shadow-sm`}>
            <MaterialIcons name="search" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            <TextInput
              className="flex-1 ml-2 h-12 text-base text-gray-900 dark:text-white"
              placeholder="Search subjects..."
              placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialIcons name="close" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Row */}
        <View className="flex-row pb-2">
          {/* Semester Filter */}
          <TouchableOpacity
            className="flex-1 mr-2 flex-row items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm"
            onPress={() => setShowSemesterModal(true)}
          >
            <Text className="text-gray-700 dark:text-gray-300 text-sm" numberOfLines={1}>
              {selectedSemester}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
          </TouchableOpacity>

          {/* Year Filter */}
          <TouchableOpacity
            className="flex-1 ml-2 flex-row items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm"
            onPress={() => setShowYearModal(true)}
          >
            <Text className="text-gray-700 dark:text-gray-300 text-sm" numberOfLines={1}>
              {selectedYear}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View className="pb-4">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row justify-between shadow-sm">
            <View className="flex-row items-center">
              <View className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 items-center justify-center">
                <MaterialIcons name="school" size={24} color={isDark ? "#93c5fd" : "#3b82f6"} />
              </View>
              <View className="ml-3">
                <Text className="text-xs text-gray-500 dark:text-gray-400">Showing Subjects</Text>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  {filteredSubjects.length}/{allSubjectsFromApi.length}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 items-center justify-center">
                <MaterialIcons name="event-note" size={24} color={isDark ? "#86efac" : "#22c55e"} />
              </View>
              <View className="ml-3">
                <Text className="text-xs text-gray-500 dark:text-gray-400">Active Years</Text>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  {academicYears.length - 1}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Semester Filter Modal */}
      <Modal
        visible={showSemesterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSemesterModal(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/60" 
          activeOpacity={1} 
          onPressOut={() => setShowSemesterModal(false)}
        >
          <View className="flex-1 justify-center px-6">
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View className="bg-white dark:bg-gray-800 rounded-xl max-h-[70%] shadow-xl">
                <Text className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                  Select Semester
                </Text>
                <ScrollView>
                  {semesters.map((semesterItem, index) => (
                    <TouchableOpacity
                      key={index}
                      className={`p-4 ${index !== semesters.length - 1 ? "border-b border-gray-200 dark:border-gray-700" : ""}`}
                      onPress={() => { 
                        setSelectedSemester(semesterItem); 
                        setShowSemesterModal(false); 
                      }}
                    >
                      <Text className={`text-base ${semesterItem === selectedSemester ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                        {semesterItem}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Year Filter Modal */}
      <Modal
        visible={showYearModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearModal(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/60" 
          activeOpacity={1} 
          onPressOut={() => setShowYearModal(false)}
        >
          <View className="flex-1 justify-center px-6 ">
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View className="bg-white dark:bg-gray-800 rounded-xl max-h-[100%] shadow-xl">
                <Text className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                  Select Academic Year
                </Text>
                <ScrollView>
                  {academicYears.map((year, index) => (
                    <TouchableOpacity
                      key={index}
                      className={`p-4 ${index !== academicYears.length - 1 ? "border-b border-gray-200 dark:border-gray-700" : ""}`}
                      onPress={() => { 
                        setSelectedYear(year); 
                        setShowYearModal(false); 
                      }}
                    >
                      <Text className={`text-base ${year === selectedYear ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Main Content */}
      <LinearGradient colors={backgroundColors} className="flex-1">
        <Animated.FlatList
          data={filteredSubjects}
          renderItem={renderSubjectItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ 
            paddingHorizontal: 16, 
            paddingTop: 16, 
            paddingBottom: 16 
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? "#FFFFFF" : "#2563eb"}
              colors={["#2563eb", "#10b981"]}
              progressBackgroundColor={isDark ? "#2d3250" : "#FFFFFF"}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          ListEmptyComponent={
            (isLoadingApi || isLoadingSemesters) && allSubjectsFromApi.length === 0 && !refreshing ? (
              <View className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-6 items-center justify-center min-h-[200px]">
                <ActivityIndicator size="large" color={isDark ? "#FFFFFF" : "#2563eb"} />
                <Text className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading Data...</Text>
              </View>
            ) : apiError && allSubjectsFromApi.length === 0 && !refreshing ? (
              <View className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-6 items-center justify-center min-h-[200px]">
                <MaterialIcons name="error-outline" size={48} color={isDark ? '#fca5a5' : '#ef4444'} />
                <Text className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Error Loading Subjects</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center px-4">
                  {apiError && 'data' in apiError && apiError.data && typeof apiError.data === 'object' && 'message' in apiError.data
                    ? (apiError.data as { message: string }).message
                    : apiError && 'message' in apiError
                    ? (apiError as { message: string }).message
                    : "An unexpected error occurred. Please try again."}
                </Text>
                <TouchableOpacity onPress={onRefresh} className="mt-6 bg-blue-500 active:bg-blue-600 px-6 py-2.5 rounded-lg shadow-md">
                  <Text className="text-white font-semibold text-base">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : !isLoadingApi && !isLoadingSemesters && filteredSubjects.length === 0 ? (
              <View className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-6 items-center justify-center min-h-[200px]">
                <MaterialIcons name="search-off" size={48} color={isDark ? "#6b7280" : "#d1d5db"} />
                <Text className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">No subjects found</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
                  {allSubjectsFromApi.length > 0 ? "Try adjusting your filters or search query." : "No subjects assigned for the current academic period."}
                </Text>
              </View>
            ) : null
          }
        />
      </LinearGradient>
    </View>
  );
}