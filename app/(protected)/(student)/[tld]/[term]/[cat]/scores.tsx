import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StatusBar,
  Animated,
  RefreshControl,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { router, useLocalSearchParams } from "expo-router";
import { useGetScoresPerCategoryQuery } from "@/store/api/apiSlice/getApi/student/subjectsEnrolledApiSlice";
import { useGetCategoryQuery } from "@/store/api/apiSlice/getApi/courseApiSlice";

interface GradingRecord {
  gradingId: number;
  gradingDetailId: number | null;
  enrollmentId: number | null;
  description: string | null;
  conductedOn: string;
  numberOfItems: number;
  score: number;
  recordedOn: string | null;
}

const CardExpandAnimation = ({
  isExpanded,
  children,
}: {
  isExpanded: boolean;
  children: React.ReactNode;
}) => {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: isExpanded ? 300 : 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isExpanded]);

  const heightInterpolate = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const opacityInterpolate = opacityAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={{
        height: heightInterpolate,
        opacity: opacityInterpolate,
        overflow: "hidden",
      }}
    >
      {children}
    </Animated.View>
  );
};

const DetailRow = ({
  label,
  value,
  fullWidth = false,
  valueClass = "",
  isDark,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
  valueClass?: string;
  isDark: boolean;
}) => (
  <View className={`${fullWidth ? "w-full" : "w-auto"} mb-1`}>
    <View className="flex-row justify-between">
      <Text
        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
      >
        {label}:
      </Text>
      <Text
        className={`text-xs font-medium ${
          valueClass || (isDark ? "text-gray-300" : "text-gray-900")
        }`}
      >
        {value}
      </Text>
    </View>
  </View>
);

const EmptyListComponent = ({ searchTerm, isDark }: { searchTerm: string; isDark: boolean }) => (
  <View
    className={`rounded-lg p-6 items-center justify-center border ${
      isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
    }`}
  >
    <MaterialIcons
      name="folder-off"
      size={40}
      color={isDark ? "#4b5563" : "#9ca3af"}
    />
    <Text
      className={`mt-4 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
    >
      {searchTerm
        ? "No matching records found"
        : "No grading records available"}
    </Text>
  </View>
);

export default function ScoreScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  
  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [100, 0],
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

  const backgroundColors: [string, string] = isDark
    ? ["#0f172a", "#1e293b"]
    : ["#f8fafc", "#e2e8f0"];

  const params = useLocalSearchParams<{
    tld?: string;
    term?: string;
    cat?: string;
  }>();
  
  const { tld, term, cat } = params;
  const tldParam = tld ? parseInt(tld, 10) : undefined;
  const termParam = term ? parseInt(term, 10) : undefined;
  const catParam = cat ? parseInt(cat, 10) : undefined;

  const { 
    data: scoreData = [], 
    isLoading: isLoadingScores,
    isFetching: isFetchingScores,
    refetch: refetchScores 
  } = useGetScoresPerCategoryQuery(
    {
      teachingLoadDetailId: tldParam ?? 0,
      termId: termParam ?? 0,
      categoryId: catParam ?? 0,
    },
    {
     
      refetchOnMountOrArgChange: true,
      pollingInterval: 30000,
    }
  );
  
  
  
  const { data: category = [] } = useGetCategoryQuery();
  const catName = category?.find((item) => item.id === catParam)?.categoryName;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchScores();
    } finally {
      setRefreshing(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredData = [...scoreData]
    .map((item) => ({
      ...item,
      conductedOn: item.conductedOn instanceof Date ? item.conductedOn.toISOString() : item.conductedOn,
      recordedOn: item.recordedOn instanceof Date ? item.recordedOn.toISOString() : item.recordedOn,
    }))
    .sort((a, b) => b.gradingId - a.gradingId) // Sort by gradingId in descending order
    .filter((item) => {
      const matchesSearch =
        (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false) ||
        item.gradingId.toString().includes(searchTerm);
  
      return matchesSearch;
    });


  

  const getScoreStatus = (score: number) => {
    if (score >= 80)
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        darkBg: "bg-green-900/30",
        darkText: "text-green-300",
      };
    if (score >= 50)
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        darkBg: "bg-blue-900/30",
        darkText: "text-blue-300",
      };
    return {
      bg: "bg-red-100",
      text: "text-red-800",
      darkBg: "bg-red-900/30",
      darkText: "text-red-300",
    };
  };

  const renderGradingCard = ({ item, index }: { item: GradingRecord, index: number }) => {
    const isExpanded = expandedId === item.gradingId;
    const scoreStatus = getScoreStatus(item.score);

    return (
      <TouchableOpacity
        className={`${
          isDark ? "bg-gray-800" : "bg-white"
        } rounded-lg mb-3 overflow-hidden border ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
        activeOpacity={0.9}
        onPress={() => toggleExpand(item.gradingId)}
      >
        {/* Card Header */}
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 pr-2">
              <Text
                className={`text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-900"
                }`}
              >
                {item.description || "No Description"}
              </Text>
            </View>

            <View
              className={`px-2 py-1 rounded-full ${
                isDark ? scoreStatus.darkBg : scoreStatus.bg
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  isDark ? scoreStatus.darkText : scoreStatus.text
                }`}
              >
                {item.score || 0}/{item.numberOfItems}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialIcons
                name="schedule"
                size={14}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
              <Text
                className={`text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                } ml-1`}
              >
                {formatDate(item.conductedOn)}
              </Text>
            </View>
          </View>
        </View>

        {/* Card Details (Expanded View) */}
        <CardExpandAnimation isExpanded={isExpanded}>
          <View
            className={`p-4 border-t ${
              isDark
                ? "border-gray-700 bg-gray-700/50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <View className="flex-row flex-wrap mb-3">
              <View className="w-1/2 pr-2 mb-3">
                <Text
                  className={`text-xs font-medium mb-1 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Assessment Details
                </Text>
                <DetailRow
                  label="Attendance Number"
                  value={(index + 1).toString()}
                  isDark={isDark}
                />
                <DetailRow
                  label="Status"
                  value={item.gradingDetailId?.toString() ? "Present" : "Absent"}
                  isDark={isDark}
                />
              </View>

              <View className="w-1/2 pl-2 mb-3">
                <Text
                  className={`text-xs font-medium mb-1 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Performance
                </Text>
                <DetailRow
                  label="Items"
                  value={item.numberOfItems.toString()}
                  isDark={isDark}
                />
                <DetailRow
                  label="Score"
                  value={`${item.score || 0}/${item.numberOfItems}`}
                  valueClass={isDark ? scoreStatus.darkText : scoreStatus.text}
                  isDark={isDark}
                />
              </View>
            </View>

            <DetailRow
              label="Recorded On"
              value={
                item.recordedOn ? formatDate(item.recordedOn) : "Not recorded"
              }
              fullWidth
              isDark={isDark}
            />
          </View>
        </CardExpandAnimation>
      </TouchableOpacity>
    );
  };

  // Calculate totals
  const totalItems = scoreData.reduce((sum, g) => sum + g.numberOfItems, 0) || 0;
  const totalScore = scoreData.reduce((sum, g) => sum + g.score, 0) || 0;

  return (
    <View className="flex-1">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={backgroundColors}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
   
        {/* Header */}
        <View className="pt-14 px-6 pb-2 z-10">
          <View className="flex-row justify-between items-center mb-4">
                 {/* Back Button */}
    <TouchableOpacity
      className={`h-10 w-10 rounded-full items-center justify-center ${
        isDark ? "bg-gray-700" : "bg-white"
      } shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}
      onPress={() => router.push({ pathname: "/[id]/grade", params: { id: tld ?? "" } })} // Adjust the path as needed
    >
      <Ionicons
        name="chevron-back"
        size={20}
        color={isDark ? "#e5e7eb" : "#4b5563"}
      />
    </TouchableOpacity>
            <View>
              <Text
                className={`text-xs font-medium ${
                  isDark ? "text-gray-400" : "text-gray-500"
                } mb-1`}
              >
                Grading Records
              </Text>
              <Text
                className={`text-xl font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Performance Dashboard
              </Text>
            </View>
            <TouchableOpacity
              className={`h-10 w-10 rounded-full items-center justify-center ${
                isDark ? "bg-gray-700" : "bg-white"
              } shadow-sm border ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
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
          <View
            className={`${
              isDark ? "bg-gray-800" : "bg-white"
            } rounded-lg flex-row items-center px-3 py-2 mb-3 shadow-sm border ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <Feather
              name="search"
              size={16}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
            <TextInput
              className={`flex-1 ml-2 text-sm ${
                isDark ? "text-white" : "text-gray-900"
              }`}
              placeholder="Search records..."
              placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm ? (
              <TouchableOpacity onPress={() => setSearchTerm("")}>
                <Feather
                  name="x"
                  size={16}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
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
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <View className="flex-row justify-between">
              <View className="flex-1 items-center">
                <Text
                  className={`text-xl font-semibold ${
                    isDark ? "text-gray-200" : "text-gray-600"
                  }`}
                >
                  {scoreData.length || 0}
                </Text>
                <Text
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Total {catName}
                </Text>
              </View>
            
              <View
                className={`w-px h-10 ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              />
              <View className="flex-1 items-center">
                <Text
                  className={`text-xl font-semibold ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {totalItems}
                </Text>
                <Text
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Total Items
                </Text>
              </View>
              <View
                className={`w-px h-10 ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              />
              <View className="flex-1 items-center">
                <Text
                  className={`text-xl font-semibold ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {totalScore}
                </Text>
                <Text
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Total Score
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
              refreshing={refreshing || isFetchingScores}
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
          {/* Grading Cards List */}
          <FlatList
            data={filteredData}
            renderItem={renderGradingCard}
            keyExtractor={(item) => item.gradingId.toString()}
            scrollEnabled={false}
            ListEmptyComponent={<EmptyListComponent searchTerm={searchTerm} isDark={isDark} />}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          {/* Bottom spacing */}
          <View className="h-6" />
        </Animated.ScrollView>
      </LinearGradient>
    </View>
  );
}