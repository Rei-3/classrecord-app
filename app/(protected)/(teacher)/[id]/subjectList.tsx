import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Animated,
  Alert,
  ColorValue,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import {
  useGetSemQuery,
  useGetTermQuery,
} from "@/store/api/apiSlice/getApi/courseApiSlice";
import { useGetAttendanceQuery } from "@/store/api/apiSlice/getApi/teacher/attendanceSlice";
import {
  useGetEnrolledQuery,
  useGetTeachingLoadQuery,
} from "@/store/api/apiSlice/getApi/teacher/teachingLoadApiSlice";
import { Terms } from "@/store/types/choicesTypes";
import { usePostAttendanceMutation } from "@/store/api/apiSlice/postApi/teacher/attendanceSlice";

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const termScrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;

  const idParam = parseInt(id, 10);

  const router = useRouter();

  const { data: termData } = useGetTermQuery();
  const { data: attendanceList, refetch: refetcAttendanceData, isLoading } = useGetAttendanceQuery({
    teachingLoadDetailId: idParam,
    termId: selectedTerm,
  });

  const { data: semData } = useGetSemQuery();

  const { data: viewEnrolled } = useGetEnrolledQuery({
    teachingLoadDetailId: idParam,
  });

  const enrollmentCount = viewEnrolled?.length || 0;

  const semesterId = semData?.find(
    (semester) => semester.id === idParam
  )?.semName;

  const [refreshing, setRefreshing] = useState(false);

  const {
    data: teachingLoadData,
    isLoading: loading,
    error,
    refetch,
  } = useGetTeachingLoadQuery();

  // Extract and flatten all teaching loads
  const allTeachingLoads =
    teachingLoadData?.flatMap((semester) =>
      semester.teachingLoadId.map((load) => ({
        ...load,
        semesterId: semester.id,
        academicYear: semester.academicYear,
        status: semester.status,
      }))
    ) || [];

  // Find the specific teaching load that matches the ID parameter
  const currentLoad = allTeachingLoads.find((load) => load.id === idParam);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundColors = (
    isDark ? ["#1e293b", "#0f172a"] : ["#f8fafc", "#e2e8f0"]
  ) as [ColorValue, ColorValue];

  // ✅ Fixed: Persistent animated value using useRef
  const scrollY = useRef(new Animated.Value(0)).current;

  // ✅ Fixed: Smoother animation interpolations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80, 140],
    outputRange: [180, 90, 0],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [1, 0.7, 0],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  const [makeAttendance] = usePostAttendanceMutation();

  const handleAttendanceSheetMake = () => {
    Alert.alert(
      "Confirm Attendance Sheet Creation",
      `Are you sure you want to create a new attendance sheet for ${currentLoad?.subjects.subjectName || "this subject"}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Create",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await makeAttendance({
                teachingLoadDetailId: idParam,
                termId: selectedTerm,
              }).unwrap();
              Alert.alert(
                "Success",
                `Attendance sheet created successfully for ${currentLoad?.subjects.subjectName || "this subject"}.`
              );
              refetcAttendanceData();
            } catch (error:any) {
              console.log(error?.data?.details.debugMessage);
              Alert.alert(
                "Error",
                error?.data?.details.debugMessage || error?.message || "Failed to create attendance sheet"
              );
            }
          }
        }
      ]
    );
  };

  // ✅ Fixed: Better term scroll with layout completion and cleanup
  useEffect(() => {
    if (termData && termData.length > 0 && selectedTerm) {
      const selectedIndex = termData.findIndex(term => term.id === selectedTerm);
      if (selectedIndex !== -1) {
        // Delay to ensure ScrollView is laid out
        const timeoutId = setTimeout(() => {
          if (termScrollViewRef.current) {
            // More accurate item width estimation
            const itemWidth = 110; // Adjust this to match your actual item width
            const itemSpacing = 12; // mr-3 = 12px
            const totalItemWidth = itemWidth + itemSpacing;
            
            const scrollToX = selectedIndex * totalItemWidth;
            const centeredScroll = Math.max(0, 
              scrollToX - (screenWidth / 2) + (itemWidth / 2)
            );
            
            termScrollViewRef.current.scrollTo({ 
              x: centeredScroll, 
              animated: true 
            });
          }
        }, 150); // Increased delay for better reliability

        return () => clearTimeout(timeoutId);
      }
    }
  }, [selectedTerm, termData, screenWidth]);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  };

  // ✅ Fixed: Improved scroll event handling
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event) => {
        // Optional: Add custom scroll logic here if needed
      }
    }
  );

  // Content section component for better organization
  const ContentSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </Text>
      {children}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1">
        <StatusBar style={isDark ? "light" : "dark"} />
        <LinearGradient
          colors={backgroundColors}
          className="flex-1 items-center justify-center"
        >
          <ActivityIndicator
            size="large"
            color={isDark ? "#FFFFFF" : "#2563eb"}
          />
          <Text className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
            Loading Subject Details...
          </Text>
        </LinearGradient>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1">
        <StatusBar style={isDark ? "light" : "dark"} />
        <LinearGradient
          colors={backgroundColors}
          className="flex-1 items-center justify-center"
        >
          <MaterialIcons
            name="error-outline"
            size={48}
            color={isDark ? "#fca5a5" : "#ef4444"}
          />
          <Text className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
            Error Loading Subject
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center px-4">
            {typeof error === "string"
              ? error
              : "An unexpected error occurred. Please try again."}
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="mt-6 bg-blue-500 active:bg-blue-600 px-6 py-2.5 rounded-lg shadow-md"
          >
            <Text className="text-white font-semibold text-base">Retry</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // Render term item
  const renderTermItem = (term: Terms) => {
    const isSelected = selectedTerm === term.id;
    return (
      <TouchableOpacity
        key={term.id}
        onPress={() => setSelectedTerm(term.id)}
        className={`mr-3 rounded-xl overflow-hidden`}
        style={{
          shadowColor: isDark ? '#000' : '#718096',
          shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
          shadowOpacity: isDark ? (isSelected ? 0.5 : 0.3) : (isSelected ? 0.25 : 0.1),
          shadowRadius: isSelected ? 6 : 3,
          elevation: isSelected ? 5 : 2,
        }}
      >
        <LinearGradient
          colors={
            isSelected
              ? isDark
                ? ['#3b82f6', '#2563eb']
                : ['#60a5fa', '#3b82f6']
              : isDark
                ? ['#334155', '#1e293b']
                : ['#f1f5f9', '#e2e8f0']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0 }}
          className={`px-5 py-3`}
        >
          <View className="flex-row items-center">
            <View 
              className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${
                isSelected 
                  ? 'bg-white/20' 
                  : isDark 
                    ? 'bg-gray-600/50' 
                    : 'bg-white/60'
              }`}
            >
              <MaterialIcons
                name={isSelected ? "event-available" : "event-note"}
                size={16}
                color={
                  isSelected
                    ? 'white'
                    : isDark
                      ? '#cbd5e1'
                      : '#475569'
                }
              />
            </View>
            <Text
              className={`font-medium ${
                isSelected
                  ? 'text-white'
                  : isDark
                    ? 'text-gray-200'
                    : 'text-gray-700'
              }`}
            >
              {term.termType}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1">
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient colors={backgroundColors} className="flex-1">
        {/* Header */}
        <View
          className={`pt-12 px-4 pb-2 flex-row items-center ${
            Platform.OS === "android" ? "mt-0" : ""
          }`}
        >
          <TouchableOpacity
            className="h-10 w-10 rounded-full items-center justify-center bg-white dark:bg-gray-700 shadow-sm mr-3"
            onPress={() => router.back()}
          >
            <MaterialIcons
              name="arrow-back"
              size={22}
              color={isDark ? "#e5e7eb" : "#4b5563"}
            />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Subject Details
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {" "}
              {currentLoad?.subjects.subjectDesc || "Loading..."}
            </Text>
          </View>
          <TouchableOpacity
            className="h-10 w-10 rounded-full items-center justify-center bg-white dark:bg-gray-700 shadow-sm"
            onPress={() =>
              Alert.alert(
                "Options",
                "Additional options will be available here"
              )
            }
          >
            <MaterialIcons
              name="more-vert"
              size={22}
              color={isDark ? "#e5e7eb" : "#4b5563"}
            />
          </TouchableOpacity>
        </View>

        {/* Animated Header Content */}
        <Animated.View
          style={{
            height: headerHeight,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          }}
          className="overflow-hidden px-4 py-2"
        >
          <View
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 ${
              Platform.OS === "ios" ? "shadow-sm" : "shadow"
            }`}
          >
            <View className="flex-row items-center mb-3">
              <View className="h-14 w-14 rounded-lg bg-blue-500 items-center justify-center">
                <Text className="text-white font-bold">
                  {currentLoad?.subjects.subjectDesc
                    ?.substring(0, 5)
                    .toUpperCase() || "SUB"}
                </Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentLoad?.subjects.subjectName || "Loading..."}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  SECTION: {currentLoad?.section} | AY:{" "}
                  {currentLoad?.academicYear}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <MaterialIcons
                  name="school"
                  size={16}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                  {semesterId}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons
                  name="groups-2"
                  size={16}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                  Enrolled: {enrollmentCount}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <MaterialIcons
                  name="access-time"
                  size={16}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                  {currentLoad?.schedule}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons
                  name="bookmark"
                  size={16}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                  {currentLoad?.status ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ✅ Fixed: Improved main ScrollView with better handling */}
        <Animated.ScrollView
          className="flex-1 px-4"
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
          onScroll={handleScroll}
          scrollEventThrottle={32}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="pt-2" />

          {/* Quick Actions */}
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity
              className={`flex-1 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl py-4 mr-2 items-center shadow-sm`}
              style={{ 
                shadowColor: isDark ? '#000' : '#718096',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.5 : 0.1,
                shadowRadius: 4,
                elevation: isDark ? 5 : 2
              }}
              onPress={() => handleAttendanceSheetMake()}
            >
              <View className={`w-12 h-12 rounded-full ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'} items-center justify-center mb-2`}>
                <MaterialIcons
                  name="add-circle"
                  size={24}
                  color={isDark ? "#34d399" : "#10b981"}
                />
              </View>
              <Text className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                Add Attendance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl py-4 ml-2 items-center shadow-sm`}
              style={{ 
                shadowColor: isDark ? '#000' : '#718096',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.5 : 0.1,
                shadowRadius: 4,
                elevation: isDark ? 5 : 2
              }}
              onPress={() => router.push(`/${id}/${selectedTerm}/camera`)}
            >
              <View className={`w-12 h-12 rounded-full ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'} items-center justify-center mb-2`}>
                <MaterialIcons
                  name="qr-code-scanner"
                  size={24}
                  color={isDark ? "#c084fc" : "#8b5cf6"}
                />
              </View>
              <Text className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                Scan To Record
              </Text>
            </TouchableOpacity>
          </View>

          {/* Term Filter - Redesigned */}
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">
                Select Term
              </Text>
              <View className="flex-row items-center just">
                <Text className="text-xs text-gray-500 dark:text-gray-400 mr-1">
                  {termData?.length || 0} terms
                </Text>
                <MaterialIcons 
                  name="filter-list" 
                  size={16} 
                  color={isDark ? "#9ca3af" : "#6b7280"} 
                />
              </View>
            </View>
            
            {/* ✅ Fixed: Better horizontal ScrollView setup */}
            <ScrollView
              ref={termScrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ 
                paddingVertical: 4, 
                paddingLeft: 2, 
                paddingRight: 20
              }}
              decelerationRate="fast"
              className="mb-2"
            >
              {termData?.map(term => renderTermItem(term))}
            </ScrollView>
          </View>

          {/* Attendance Records */}
          <ContentSection title="Attendance Records">
            {isLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color={isDark ? "#60a5fa" : "#3b82f6"} />
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Loading attendance records...
                </Text>
              </View>
            ) : attendanceList?.length === 0 ? (
              <View className="py-8 items-center">
                <MaterialIcons
                  name="event-busy"
                  size={40}
                  color={isDark ? "rgba(156, 163, 175, 0.5)" : "rgba(107, 114, 128, 0.3)"}
                />
                <Text className="text-gray-500 dark:text-gray-400 mt-3 text-center">
                  No attendance records found for this term
                </Text>
                <TouchableOpacity
                  className={`mt-4 px-4 py-2 rounded-full ${isDark ? 'bg-blue-700' : 'bg-blue-500'} flex-row items-center`}
                  onPress={() => Alert.alert("Add Attendance", "Create a new attendance record")}
                >
                  <MaterialIcons name="add" size={18} color="#fff" />
                  <Text className="text-white font-medium ml-1">Add New Session</Text>
                </TouchableOpacity>
              </View>
            ) : (
              attendanceList?.map((record: any) => (
                <TouchableOpacity
                  key={record.id}
                  className={`${isDark ? 'bg-gray-700/70' : 'bg-gray-50'} rounded-xl p-4 mb-3 shadow-sm`}
                  style={{ 
                    shadowColor: isDark ? '#000' : '#718096',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDark ? 0.4 : 0.1,
                    shadowRadius: 2,
                    elevation: isDark ? 3 : 1
                  }}
                  onPress={() =>
                    Alert.alert(
                      "Attendance Details",
                      `Description: ${record.description || "N/A"}\n` +
                        `Date: ${new Date(
                          record.date
                        ).toLocaleDateString()}\n` +
                        `Items: ${record.numberOfItems}`
                    )
                  }
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                      <View className={`w-10 h-10 rounded-full ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'} items-center justify-center mr-3`}>
                        <MaterialIcons name="event" size={20} color={isDark ? "#60a5fa" : "#3b82f6"} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-800 dark:text-gray-100 font-medium">
                          {record.description || "Attendance Session"}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <View className={`px-2.5 py-1 rounded-full ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'} mr-2`}>
                        <Text className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                          score: {record.numberOfItems} 
                        </Text>
                      </View>
                      <MaterialIcons
                        name="chevron-right"
                        size={20}
                        color={isDark ? "#9ca3af" : "#6b7280"}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ContentSection>

          {/* Bottom spacing */}
          <View className="h-6" />
        </Animated.ScrollView>
      </LinearGradient>
    </View>
  );
}