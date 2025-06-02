import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import OtpModal from "@/components/modals/OtpModal";
import { useRegisterStudentMutation } from "@/store/api/apiSlice/auhtApiSlice";
import { Loading } from "@/components/custom/loading";
import DefaultModal from "@/components/modals/defaultModal";

const registerSchema = z.object({
  fname: z.string().min(1, "First name is required"),
  lname: z.string().min(1, "Last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  email: z.string().email("Invalid email address"),
  gender: z.boolean(),
  mname: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateValue, setDateValue] = useState(new Date());

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fname: "",
      mname: "",
      lname: "",
      dob: "",
      email: "",
      gender: false,
    },
  });

  const backgroundColors: [string, string, string] = isDark
    ? ["#1a1c2e", "#2d3250", "#1a1c2e"]
    : ["#f0f5ff", "#e6f0ff", "#f0f5ff"];

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setDateValue(date);
      const formattedDate = date.toISOString().split("T")[0];
      setValue("dob", formattedDate);
    }
  };

  const [registerUser, { isLoading, isError }] = useRegisterStudentMutation();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const register = await registerUser({
        ...data,
        mname: data.mname || "",
      }).unwrap();
      // console.log("Registration response:", register);
      setTimeout(() => {
        setLoading(false);
        setShowOtpModal(true);
      }, 1000);
    } catch (error: any) {
      setErrorMessage(error?.data?.message || "Registration failed");
      setTimeout(() => setErrorMessage(null), 5000);
      setLoading(false);
    }
  };

  {
    /* Header */
  }

  // const handleOtpSubmit = (otpData :any) => {
  //   setLoading(true);
  //   // Combine registration and OTP data
  //   const completeData = {
  //     ...control._formValues,
  //     ...otpData,
  //     courseId: parseInt(otpData.courseId),
  //   };

  //   console.log("Complete registration data:", completeData);

  //   // Simulate API call
  //   setTimeout(() => {
  //     setLoading(false);
  //     setShowOtpModal(false);
  //     router.push("/login");
  //   }, 1500);
  // };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient colors={backgroundColors} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center justify-center px-6 py-10">
            <View className="w-full max-w-md">
              <View className="items-center mb-6">
                <View
                  className={`h-16 w-16 rounded-2xl items-center justify-center mb-3 ${
                    isDark ? "bg-blue-500" : "bg-blue-600"
                  }`}
                >
                  <MaterialIcons name="person-add" size={32} color="white" />
                </View>
                <Text className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                  Create Account
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Join our new school performace tracker platform
                </Text>
              </View>

              {/* Registration Form Card */}
              <View className="bg-white dark:bg-gray-800 p-6 rounded-2xl boxShadow">
                {/* First Name */}
                <Controller
                  control={control}
                  name="fname"
                  render={({ field: { onChange, value } }) => (
                    <View className="mb-4">
                      <Text className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                        First Name
                      </Text>
                      <View className="relative">
                        <TextInput
                          className={`border rounded-xl p-3.5 pl-11 ${
                            errors.fname
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-700"
                          } ${
                            value
                              ? "bg-blue-50 dark:bg-gray-750"
                              : "bg-gray-50 dark:bg-gray-700"
                          } text-gray-900 dark:text-black`}
                          placeholder="John"
                          placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
                          onChangeText={onChange}
                          value={value}
                        />
                        <View className="absolute left-3.5 top-3.5">
                          <MaterialIcons
                            name="person"
                            size={20}
                            color={
                              errors.fname
                                ? "#ef4444"
                                : isDark
                                ? "#9ca3af"
                                : "#6b7280"
                            }
                          />
                        </View>
                      </View>
                      {errors.fname && (
                        <Text className="text-red-500 text-xs mt-1">
                          {errors.fname.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                {/* Middle Name */}
                <Controller
                  control={control}
                  name="mname"
                  render={({ field: { onChange, value } }) => (
                    <View className="mb-4">
                      <Text className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                        Middle Name (Optional)
                      </Text>
                      <View className="relative">
                        <TextInput
                          className={`border rounded-xl p-3.5 pl-11 
                            border-gray-200 dark:border-gray-700
                            ${
                              value
                                ? "bg-blue-50 dark:bg-gray-750"
                                : "bg-gray-50 dark:bg-gray-700"
                            }
                            text-gray-900 dark:text-black`}
                          placeholder="David"
                          placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
                          onChangeText={onChange}
                          value={value}
                        />
                        <View className="absolute left-3.5 top-3.5">
                          <MaterialIcons
                            name="person-outline"
                            size={20}
                            color={isDark ? "#9ca3af" : "#6b7280"}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                />

                {/* Last Name */}
                <Controller
                  control={control}
                  name="lname"
                  render={({ field: { onChange, value } }) => (
                    <View className="mb-4">
                      <Text className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                        Last Name
                      </Text>
                      <View className="relative">
                        <TextInput
                          className={`border rounded-xl p-3.5 pl-11 ${
                            errors.lname
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-700"
                          } ${
                            value
                              ? "bg-blue-50 dark:bg-gray-750"
                              : "bg-gray-50 dark:bg-gray-700"
                          } text-gray-900 dark:text-black`}
                          placeholder="Doe"
                          placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
                          onChangeText={onChange}
                          value={value}
                        />
                        <View className="absolute left-3.5 top-3.5">
                          <MaterialIcons
                            name="person"
                            size={20}
                            color={
                              errors.lname
                                ? "#ef4444"
                                : isDark
                                ? "#9ca3af"
                                : "#6b7280"
                            }
                          />
                        </View>
                      </View>
                      {errors.lname && (
                        <Text className="text-red-500 text-xs mt-1">
                          {errors.lname.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                {/* Date of Birth */}
                <Controller
                  control={control}
                  name="dob"
                  render={({ field: { value } }) => (
                    <View className="mb-4">
                      <Text className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                        Date of Birth
                      </Text>
                      <Pressable
                        className={`border rounded-xl p-3.5 pl-11 relative flex-row items-center justify-between
                          ${
                            errors.dob
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-700"
                          }
                          ${
                            value
                              ? "bg-blue-50 dark:bg-gray-750"
                              : "bg-gray-50 dark:bg-gray-700"
                          }`}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text
                          className={
                            value
                              ? "text-gray-900 dark:text-black"
                              : "text-gray-400 dark:text-gray-500"
                          }
                        >
                          {value || "YYYY-MM-DD"}
                        </Text>
                        <MaterialIcons
                          name="calendar-today"
                          size={20}
                          color={isDark ? "#9ca3af" : "#6b7280"}
                        />
                        <View className="absolute left-3.5 top-3.5">
                          <MaterialIcons
                            name="cake"
                            size={20}
                            color={
                              errors.dob
                                ? "#ef4444"
                                : isDark
                                ? "#9ca3af"
                                : "#6b7280"
                            }
                          />
                        </View>
                      </Pressable>
                      {showDatePicker && (
                        <DateTimePicker
                          value={dateValue}
                          mode="date"
                          display="spinner"
                          onChange={handleDateChange}
                          maximumDate={new Date()}
                        />
                      )}
                      {errors.dob && (
                        <Text className="text-red-500 text-xs mt-1">
                          {errors.dob.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                {/* Email */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <View className="mb-4">
                      <Text className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                        Email Address
                      </Text>
                      <View className="relative">
                        <TextInput
                          className={`border rounded-xl p-3.5 pl-11 ${
                            errors.email
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-700"
                          } ${
                            value
                              ? "bg-blue-50 dark:bg-gray-750"
                              : "bg-gray-50 dark:bg-gray-700"
                          } text-gray-900 dark:text-black`}
                          placeholder="must be a gmail address"
                          placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          onChangeText={onChange}
                          value={value}
                        />
                        <View className="absolute left-3.5 top-3.5">
                          <MaterialIcons
                            name="email"
                            size={20}
                            color={
                              errors.email
                                ? "#ef4444"
                                : isDark
                                ? "#9ca3af"
                                : "#6b7280"
                            }
                          />
                        </View>
                      </View>
                      {errors.email && (
                        <Text className="text-red-500 text-xs mt-1">
                          {errors.email.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
                {errorMessage && (
                  <View
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                  >
                    <Text className="text-sm">{errorMessage}</Text>
                  </View>
                )}

                {/* Gender */}
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { value, onChange } }) => (
                    <View className="flex-row items-center justify-between mb-6 px-2">
                      <View className="flex-row items-center">
                        <MaterialIcons
                          name={value ? "male" : "female"}
                          size={20}
                          color={isDark ? "#9ca3af" : "#6b7280"}
                          style={{ marginRight: 8 }}
                        />
                        <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                          Gender: {value ? "Male" : "Female"}
                        </Text>
                      </View>
                      <Switch
                        value={value}
                        onValueChange={onChange}
                        trackColor={{
                          false: "#cbd5e1",
                          true: isDark ? "#60a5fa" : "#3b82f6",
                        }}
                        thumbColor={value ? "#fff" : "#fff"}
                        ios_backgroundColor="#cbd5e1"
                      />
                    </View>
                  )}
                />

                {/* Terms and Conditions */}

                {/* Register Button */}
                <Pressable
                  className={`${
                    loading ? "bg-blue-500" : "bg-blue-600"
                  } dark:bg-blue-500 rounded-xl py-3.5 items-center mb-4`}
                  onPress={handleSubmit(onSubmit)}
                  disabled={loading}
                >
                  <Text className="text-white font-semibold text-base">
                    {loading ? "Processing..." : "Register"}
                  </Text>
                </Pressable>
                <Pressable
                  className="bg-gray-200 dark:bg-gray-700 rounded-xl py-2 items-center mb-4"
                  onPress={() => setShowOtpModal(true)}
                >
                  <Text className="text-gray-700 dark:text-gray-300 text-sm">
                    Reopen OTP Verification
                  </Text>
                </Pressable>

                {/* Login Option */}
                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-600 dark:text-gray-400">
                    Already have an account?
                  </Text>
                  <Pressable
                    onPress={() => router.push("/login")}
                    className="ml-1"
                  >
                    <Text className="text-blue-600 dark:text-blue-400 font-medium">
                      Sign In
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Enterprise Features */}
              <View className="mt-6">
                <View className="flex-row justify-between">
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="verified-user"
                      size={16}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                    <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      Secure Registration
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="privacy-tip"
                      size={16}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                    <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      GDPR Compliant
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <Modal visible={isLoading} transparent={true} animationType="fade">
          <View className="flex-1 justify-center items-center bg-black/50">
            <DefaultModal isOpen={true}>
              <Text className="mb-4 dark">Registering</Text>
              <Loading size="large" color="text-blue-500" fullScreen={false} />
            </DefaultModal>
          </View>
        </Modal>

        {/* OTP Verification Modal */}
        <Modal
          visible={showOtpModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowOtpModal(false)}
        >
          <OtpModal
            visible={showOtpModal}
            onClose={() => setShowOtpModal(false)}
            loading={loading}
          />
        </Modal>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
