import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  RefreshControl,
  Modal,
  Pressable,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import {
  useGetGradingCompositonQuery,
  useGetSubjectSemGradesQuery,
  useGetSubjectTermGradesQuery,
} from "@/store/api/apiSlice/getApi/student/subjectsEnrolledApiSlice";
import {
  useGetCategoryQuery,
  useGetTermQuery,
} from "@/store/api/apiSlice/getApi/courseApiSlice";
import { router, useLocalSearchParams } from "expo-router";

export default function EnterpriseGradeScreen() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [showTermPicker, setShowTermPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { id } = useLocalSearchParams<{ id: string }>();

  const idParam = parseInt(id, 10);

  // Fetching data
  //term grades
  const { data: termGradeData } = useGetSubjectTermGradesQuery({
    teachingLoadDetailId: idParam,
    termId: selectedTerm,
  },
  {
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
  }
);

  //sem grades
  const { data: semGradeData } = useGetSubjectSemGradesQuery({
    teachingLoadDetailId: idParam,
  },
  {
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
  });
  //term
  const { data: termData } = useGetTermQuery();
  //categories
  const { data: categoriesData } = useGetCategoryQuery();
  //grading Comp
  const { data: gradingCompData } = useGetGradingCompositonQuery({
    teachingLoadDetailId: idParam,
  },
  {
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
  }
);

// console.log(semGradeData)
// console.log(termGradeData)

  const whatTerm = termData?.find((term) => term.id === selectedTerm);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header animation
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

  // Colors
  const backgroundColors: [string, string] = isDark
    ? ["#0f172a", "#1e293b"]
    : ["#f8fafc", "#e2e8f0"];

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };
  const categoryConfig: Record<string, {
      icon: "quiz" | "assignment" | "description" | "people";
      activeColor: string;
      inactiveColor: string;
      bgColor: string;
      borderColor: string;
      textColor: string;
  }> = {
      quiz: {
        icon: 'quiz',
        activeColor: isDark ? '#93c5fd' : '#2563eb',
        inactiveColor: isDark ? '#9ca3af' : '#6b7280',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        borderColor: 'border-blue-500 dark:border-blue-400',
        textColor: 'text-blue-700 dark:text-blue-300'
      },
      activity: {
        icon: 'assignment',
        activeColor: isDark ? '#86efac' : '#059669',
        inactiveColor: isDark ? '#9ca3af' : '#6b7280',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        borderColor: 'border-green-500 dark:border-green-400',
        textColor: 'text-green-700 dark:text-green-300'
      },
      exam: {
        icon: 'description',
        activeColor: isDark ? '#fca5a5' : '#dc2626',
        inactiveColor: isDark ? '#9ca3af' : '#6b7280',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-red-500 dark:border-red-400',
        textColor: 'text-red-700 dark:text-red-300'
      },
      attendance: {
        icon: 'people',
        activeColor: isDark ? '#fcd34d' : '#d97706',
        inactiveColor: isDark ? '#9ca3af' : '#6b7280',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        borderColor: 'border-yellow-500 dark:border-yellow-400',
        textColor: 'text-yellow-700 dark:text-yellow-300'
      }
    };
  // Grade color helper
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return isDark ? "#22c55e" : "#16a34a";
    if (grade >= 80) return isDark ? "#3b82f6" : "#2563eb";
    if (grade >= 70) return isDark ? "#f59e0b" : "#d97706";
    return isDark ? "#ef4444" : "#dc2626";
  };

  // Letter grade helper
  const getLetterGrade = (grade: number) => {
    if (grade >= 90) return "A" + (grade >= 97 ? "+" : grade <= 93 ? "-" : "");
    if (grade >= 80) return "B" + (grade >= 87 ? "+" : grade <= 83 ? "-" : "");
    if (grade >= 70) return "C" + (grade >= 77 ? "+" : grade <= 73 ? "-" : "");
    if (grade >= 60) return "D" + (grade >= 67 ? "+" : grade <= 63 ? "-" : "");
    return "F";
  };

  // Render grade component
  const renderGradeComponent = (title: any, value: any, weight: any) => (
    <View className="flex-row justify-between items-center mb-3">
      <View className="flex-row items-center">
        <View
          className={`p-2 rounded-lg ${
            title === "Quiz"
              ? "bg-blue-100 dark:bg-blue-900/30"
              : title === "Activity"
              ? "bg-green-100 dark:bg-green-900/30"
              : title === "Exam"
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-yellow-100 dark:bg-yellow-900/30"
          }`}
        >
          <MaterialIcons
            name={
              title === "Quiz"
                ? "quiz"
                : title === "Activity"
                ? "assignment"
                : title === "Exam"
                ? "description"
                : "people"
            }
            size={18}
            color={
              title === "Quizzes"
                ? isDark
                  ? "#93c5fd"
                  : "#2563eb"
                : title === "Activities"
                ? isDark
                  ? "#86efac"
                  : "#059669"
                : title === "Exam"
                ? isDark
                  ? "#fca5a5"
                  : "#dc2626"
                : isDark
                ? "#fcd34d"
                : "#d97706"
            }
          />
        </View>
        <Text className="ml-2 font-medium text-gray-700 dark:text-gray-300">
          {title}
        </Text>
      </View>
      <View className="flex-row items-center">
        <View
          className={`mr-2 px-2 py-0.5 rounded ${
            value >= 90
              ? "bg-green-100 dark:bg-green-900/30"
              : value >= 80
              ? "bg-blue-100 dark:bg-blue-900/30"
              : value >= 70
              ? "bg-yellow-100 dark:bg-yellow-900/30"
              : "bg-red-100 dark:bg-red-900/30"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              value >= 90
                ? "text-green-700 dark:text-green-300"
                : value >= 80
                ? "text-blue-700 dark:text-blue-300"
                : value >= 70
                ? "text-yellow-700 dark:text-yellow-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {value}%
          </Text>
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          ({weight}% )
        </Text>
      </View>
    </View>
  );

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
        <SafeAreaView className="pt-14 px-6 pb-2 z-10">
          <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
      className={`h-10 w-10 rounded-full items-center justify-center ${
        isDark ? "bg-gray-700" : "bg-white"
      } shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}
      onPress={() => router.back()} // Adjust the path as needed
    >
      <Ionicons
        name="chevron-back"
        size={20}
        color={isDark ? "#e5e7eb" : "#4b5563"}
      />
    </TouchableOpacity>
            <View>
              <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Academic Performance
              </Text>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white">
                Grade Dashboard
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
        </SafeAreaView>

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
                <Text
                  className={`text-xl font-semibold ${
                    (termGradeData?.finalGrade ?? 0) >= 90
                      ? "text-green-500 dark:text-green-400"
                      : (termGradeData?.finalGrade ?? 0) >= 80
                      ? "text-blue-500 dark:text-blue-400"
                      : (termGradeData?.finalGrade ?? 0) >= 70
                      ? "text-yellow-500 dark:text-yellow-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {termGradeData?.finalGrade}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {whatTerm?.termType}
                </Text>
              </View>
              <View className="w-px h-10 bg-gray-200 dark:bg-gray-700 mx-2" />
              <View className="flex-1 items-center">
                <Text
                  className={`text-xl font-semibold ${
                    (semGradeData?.semesterGrade ?? 0) >= 90
                      ? "text-green-500 dark:text-green-400"
                      : (semGradeData?.semesterGrade ?? 0) >= 80
                      ? "text-blue-500 dark:text-blue-400"
                      : (semGradeData?.semesterGrade ?? 0) >= 70
                      ? "text-yellow-500 dark:text-yellow-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {semGradeData?.semesterGrade ?? 0}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Semester Grade
                </Text>
              </View>
              <View className="w-px h-10 bg-gray-200 dark:bg-gray-700 mx-2" />
              <View className="flex-1 items-center">
                <Text
                  className={`text-xl font-semibold ${
                    (semGradeData?.semesterGrade ?? 0) >= 90
                      ? "text-green-500 dark:text-green-400"
                      : (semGradeData?.semesterGrade ?? 0) >= 80
                      ? "text-blue-500 dark:text-blue-400"
                      : (semGradeData?.semesterGrade ?? 0) >= 70
                      ? "text-yellow-500 dark:text-yellow-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {getLetterGrade(semGradeData?.semesterGrade ?? 0)}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Grade
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
          <View className="mb-2">
           
          </View>
          {/* Filters Row */}
          <View className="flex-row justify-between items-center mb-4">
            {/* Subject Category Picker */}

            {/* Term Filter */}
            <View className="flex-1 ">
              <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                TERM
              </Text>
              <TouchableOpacity
                className={`${
                  isDark ? "bg-gray-800" : "bg-white"
                } rounded-lg flex-row items-center px-3 py-2.5 shadow-sm border ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
                onPress={() => setShowTermPicker(true)}
              >
                <MaterialIcons
                  name="event"
                  size={16}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                  className="mr-2"
                />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900 dark:text-white">
                    {whatTerm?.termType || "Select Term"}
                  </Text>
                </View>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={24}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              VIEW SCORES IN CATEGORY
            </Text>
            <View className="flex-row mb-2 justify-center">
              
            {categoriesData?.map((category) => {
        const config = categoryConfig[category.categoryName.toLowerCase() as keyof typeof categoryConfig] || {
          icon: 'help',
          activeColor: isDark ? '#a78bfa' : '#7c3aed',
          inactiveColor: isDark ? '#9ca3af' : '#6b7280',
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
          borderColor: 'border-purple-500 dark:border-purple-400',
          textColor: 'text-purple-700 dark:text-purple-300'
        };

        const isSelected = selectedCategory === category.id;
       
        return (
          <TouchableOpacity
            key={category.id}
            className={`items-center justify-center p-3 rounded-lg w-20 h-20 m-1 ${
              isSelected
                ? `${config.bgColor} border-2 ${config.borderColor}`
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
            onPress={() => {
              setSelectedCategory(category.id)
              router.push(`/${idParam}/${selectedTerm}/${category.id}/scores`);

            } }
            
          >
            
            <MaterialIcons 
              name={config.icon} 
              size={24} 
              color={isSelected ? config.activeColor : config.inactiveColor} 
            />
            <Text className={`mt-1 text-xs ${
              isSelected
                ? `${config.textColor} font-medium`
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {category.categoryName}
            </Text>
          </TouchableOpacity>
        );
      })}
            </View>

          {/* Term Grade Card */}
          <View className="mb-4">
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">
              CURRENT GRADE DETAILS
            </Text>
            <View
              className={`${
                isDark ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-sm p-4 border ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  {whatTerm?.termType} Assessment
                </Text>
                <View
                  className={`py-1 px-3 rounded-full ${
                    whatTerm?.termType
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "bg-purple-100 dark:bg-purple-900/30"
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      whatTerm?.termType
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-purple-700 dark:text-purple-300"
                    }`}
                  >
                    {whatTerm?.termType ? termGradeData?.finalGrade : 0}%
                  </Text>
                </View>
              </View>

              {/* Components */}
              <View className="mb-4">
                <View className="px-1 mb-3 border-l-4 border-gray-300 dark:border-gray-600">
                  <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    GRADE COMPONENTS
                  </Text>
                </View>
                {categoriesData?.map((category) => {
                  // Type-safe access to scores
                  type Score = { [key: string]: number }; // Define the Score type
                  const scores = termGradeData?.scores as Score | undefined;
                  const scoreKey = Object.keys(scores || {}).find(
                    (key) =>
                      key.toLowerCase() === category.categoryName.toLowerCase()
                  ) as keyof Score | undefined;

                  const scoreValue = scoreKey ? scores?.[scoreKey] : undefined;

                  // Find the matching composition weight
                  const composition = gradingCompData?.composition.find(
                    (comp) => comp.category.id === category.id
                  )?.percentage;

                  return (
                    <View key={category.id}>
                      {renderGradeComponent(
                        category.categoryName,
                        scoreValue,
                        composition
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Progress Bar */}
              <View className="mb-2">
                <View className="px-1 mb-3 border-l-4 border-gray-300 dark:border-gray-600">
                  <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    PERFORMANCE LEVEL
                  </Text>
                </View>
                <View className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${
                        whatTerm?.termType ? termGradeData?.finalGrade ?? 0 : 0
                      }%`,
                      backgroundColor: getGradeColor(
                        whatTerm?.termType ? termGradeData?.finalGrade ?? 0 : 0
                      ),
                    }}
                  />
                </View>
              </View>

              {/* Grade Interpretation */}
              <View className="flex-row justify-between items-center mt-4">
                <View className="flex-row items-center">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Letter Grade
                  </Text>
                  <View className="ml-2 h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                </View>
                <Text
                  className={`font-bold text-base ${
                    (whatTerm?.id === selectedTerm
                      ? semGradeData?.termGrades.Midterm ?? 0
                      : semGradeData?.termGrades.Final ?? 0) >= 90
                      ? "text-green-600 dark:text-green-400"
                      : (whatTerm?.id === selectedTerm
                          ? semGradeData?.termGrades.Midterm ?? 0
                          : semGradeData?.termGrades.Final ?? 0) >= 80
                      ? "text-blue-600 dark:text-blue-400"
                      : (whatTerm?.id === selectedTerm
                          ? semGradeData?.termGrades.Midterm ?? 0
                          : semGradeData?.termGrades.Final ?? 0) >= 70
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {getLetterGrade(
                    whatTerm?.id === selectedTerm
                      ? semGradeData?.termGrades?.Midterm ?? 0
                      : semGradeData?.termGrades?.Final ?? 0
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* Semester Grade Card */}
          <View className="mb-6">
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">
              SEMESTER SUMMARY
            </Text>
            <View
              className={`${
                isDark ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-sm p-4 border ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  Overall Performance
                </Text>
                <View
                  className={`py-1 px-3 rounded-full ${
                    (semGradeData?.semesterGrade ?? 0) >= 90
                      ? "bg-green-100 dark:bg-green-900/30"
                      : (semGradeData?.semesterGrade ?? 0) >= 80
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : (semGradeData?.semesterGrade ?? 0) >= 70
                      ? "bg-yellow-100 dark:bg-yellow-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      (semGradeData?.semesterGrade ?? 0) >= 90
                        ? "text-green-700 dark:text-green-300"
                        : (semGradeData?.semesterGrade ?? 0) >= 80
                        ? "text-blue-700 dark:text-blue-300"
                        : (semGradeData?.semesterGrade ?? 0) >= 70
                        ? "text-yellow-700 dark:text-yellow-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {semGradeData?.semesterGrade ?? 0}%
                  </Text>
                </View>
              </View>

              {/* Components */}
              <View className="mb-4">
                <View className="px-1 mb-3 border-l-4 border-gray-300 dark:border-gray-600">
                  <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    TERM CONTRIBUTIONS
                  </Text>
                </View>

                {/* Midterm */}
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                      <MaterialIcons
                        name="event"
                        size={18}
                        color={isDark ? "#a5b4fc" : "#4f46e5"}
                      />
                    </View>
                    <Text className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                      Midterm Grade
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View
                      className={`mr-2 px-2 py-0.5 rounded ${
                        (semGradeData?.termGrades.Midterm ?? 0) >= 90
                          ? "bg-green-100 dark:bg-green-900/30"
                          : (semGradeData?.termGrades.Midterm ?? 0) >= 80
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : (semGradeData?.termGrades.Midterm ?? 0) >= 70
                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          (semGradeData?.termGrades.Midterm ?? 0) >= 90
                            ? "text-green-700 dark:text-green-300"
                            : (semGradeData?.termGrades.Midterm ?? 0) >= 80
                            ? "text-blue-700 dark:text-blue-300"
                            : (semGradeData?.termGrades.Midterm ?? 0) >= 70
                            ? "text-yellow-700 dark:text-yellow-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {semGradeData?.termGrades.Midterm ?? 0}%
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      (50%)
                    </Text>
                  </View>
                </View>

                {/* Final */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                      <MaterialIcons
                        name="event-note"
                        size={18}
                        color={isDark ? "#d8b4fe" : "#7c3aed"}
                      />
                    </View>
                    <Text className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                      Final Grade
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View
                      className={`mr-2 px-2 py-0.5 rounded ${
                        (semGradeData?.termGrades.Final ?? 0) >= 90
                          ? "bg-green-100 dark:bg-green-900/30"
                          : (semGradeData?.termGrades.Final ?? 0) >= 80
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : (semGradeData?.termGrades.Final ?? 0) >= 70
                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          (semGradeData?.termGrades.Final ?? 0) >= 90
                            ? "text-green-700 dark:text-green-300"
                            : (semGradeData?.termGrades.Final ?? 0) >= 80
                            ? "text-blue-700 dark:text-blue-300"
                            : (semGradeData?.termGrades.Final ?? 0) >= 70
                            ? "text-yellow-700 dark:text-yellow-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {semGradeData?.termGrades.Final ?? 0}%
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      (50%)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="mb-2">
                <View className="px-1 mb-3 border-l-4 border-gray-300 dark:border-gray-600">
                  <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    ACADEMIC STANDING
                  </Text>
                </View>
                <View className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${semGradeData?.semesterGrade ?? 0}%`,
                      backgroundColor: getGradeColor(
                        semGradeData?.semesterGrade ?? 0
                      ),
                    }}
                  />
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    0%
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    50%
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    100%
                  </Text>
                </View>
              </View>

              {/* Grade Interpretation */}
              <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Final Letter Grade
                </Text>
                <View
                  className={`py-1.5 px-4 rounded-md ${
                    (semGradeData?.semesterGrade ?? 0) >= 90
                      ? "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                      : (semGradeData?.semesterGrade ?? 0) >= 80
                      ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                      : (semGradeData?.semesterGrade ?? 0) >= 70
                      ? "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800"
                      : "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                  }`}
                >
                  <Text
                    className={`text-base font-bold ${
                      (semGradeData?.semesterGrade ?? 0) >= 90
                        ? "text-green-700 dark:text-green-300"
                        : (semGradeData?.semesterGrade ?? 0) >= 80
                        ? "text-blue-700 dark:text-blue-300"
                        : (semGradeData?.semesterGrade ?? 0) >= 70
                        ? "text-yellow-700 dark:text-yellow-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {getLetterGrade(semGradeData?.semesterGrade ?? 0)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>

        {/* Term Picker Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showTermPicker}
          onRequestClose={() => setShowTermPicker(false)}
        >
          <Pressable
            className="flex-1 bg-black/50 justify-center items-center"
            onPress={() => setShowTermPicker(false)}
          >
            <View
              className={`w-4/5 rounded-lg p-6 ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
            >
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Select Term
              </Text>
              {termData?.map((term) => (
                <TouchableOpacity
                  key={term.id}
                  className={`p-4 rounded-lg mb-2 ${
                    selectedTerm === term.id
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : isDark
                      ? "bg-gray-700"
                      : "bg-gray-100"
                  }`}
                  onPress={() => {
                    setSelectedTerm(term.id);
                    setShowTermPicker(false);
                  }}
                >
                  <Text
                    className={`font-medium ${
                      selectedTerm === term.id
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {term.termType}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </LinearGradient>
    </View>
  );
}
