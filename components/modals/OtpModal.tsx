import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetCoursesQuery } from "@/store/api/apiSlice/getApi/courseApiSlice";
import { Picker } from "@react-native-picker/picker";
import { useRegisterStudentUsernameMutation } from "@/store/api/apiSlice/auhtApiSlice";
import { Loading } from "../custom/loading";
import DefaultModal from "./defaultModal";
import { router } from "expo-router";

const otpSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  courseId: z.number().min(1, "Course ID is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

interface OtpModalProps {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
}

type OtpFormData = z.infer<typeof otpSchema>;

export default function OtpModal({
  visible,
  onClose,
  loading,
}: OtpModalProps) {

    const [errorMessage, setErrorMessage] = useState<string | null> ("");
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      username: "",
      password: "",
      courseId: 0,
      otp: "",
    },
  });

  //this is an array //getcourses
  const { data: courses } = useGetCoursesQuery();

  const [registerUsernamePassord, {isLoading}] = useRegisterStudentUsernameMutation();

  const onRegister = async (data : OtpFormData) => {
  
    try {
        await registerUsernamePassord({
            userData: {
                username: data.username,
                password: data.password,
                courseId: data.courseId,
            },
            otp: data.otp,
        }).unwrap;
        // console.log("gdad")
        
        router.replace("/login");
    }
    catch (error:any) {
        setErrorMessage(error?.data?.message || "An error occurred");
        setTimeout(() => setErrorMessage(null), 2000);
     
    }
    

}

  return (
    <View className="flex-1 justify-center items-center bg-black/50 absolute top-0 bottom-0 left-0 right-0">
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-11/12 max-w-md boxShadow">
      
        {/* OTP Header */}
        <View className="items-center mb-4">
          <View
            className={`h-12 w-12 rounded-full items-center justify-center mb-3 ${
              isDark ? "bg-blue-500" : "bg-blue-600"
            }`}
          >
            <MaterialIcons name="sms" size={24} color="white" />
          </View>
          <Text className="text-xl font-bold text-center text-gray-900 dark:text-white">
            OTP Verification
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            We've sent a verification code to your email
          </Text>
        </View>
        {errorMessage && (
                  <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <Text className="text-sm">{errorMessage}</Text>
                  </View>
                )}
        {/* OTP Input */}
        <Controller
          control={control}
          name="otp"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <Text className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                OTP Code
              </Text>
              <TextInput
                className={`border rounded-xl p-3.5 pl-11 ${
                  errors.otp
                    ? "border-red-500"
                    : "border-gray-200 dark:border-gray-700"
                } ${
                  value
                    ? "bg-blue-50 dark:bg-gray-750"
                    : "bg-gray-50 dark:bg-gray-700"
                } text-gray-900 dark:text-black`}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
                keyboardType="default"
                onChangeText={onChange}
                value={value}
              />
              {errors.otp && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.otp.message}
                </Text>
              )}
            </View>
          )}
        />

        {/* Username */}
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <Text className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Enter your Student ID
              </Text>
              <View className="relative">
                <TextInput
                  className={`border rounded-xl p-3.5 pl-11 ${
                    errors.username
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  } ${
                    value
                      ? "bg-blue-50 dark:bg-gray-750"
                      : "bg-gray-50 dark:bg-gray-700"
                  } text-gray-900 dark:text-black`}
                  placeholder="johndoe123"
                  placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                />
                <View className="absolute left-3.5 top-3.5">
                  <MaterialIcons
                    name="account-circle"
                    size={20}
                    color={
                      errors.username
                        ? "#ef4444"
                        : isDark
                        ? "#9ca3af"
                        : "#6b7280"
                    }
                  />
                </View>
              </View>
              {errors.username && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.username.message}
                </Text>
              )}
            </View>
          )}
        />

        {/* Password */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <Text className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Set a Password
              </Text>
              <View className="relative">
                <TextInput
                  className={`border rounded-xl p-3.5 pl-11 ${
                    errors.password
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  } ${
                    value
                      ? "bg-blue-50 dark:bg-gray-750"
                      : "bg-gray-50 dark:bg-gray-700"
                  } text-gray-900 dark:text-black`}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                />
                <View className="absolute left-3.5 top-3.5">
                  <MaterialIcons
                    name="lock"
                    size={20}
                    color={
                      errors.password
                        ? "#ef4444"
                        : isDark
                        ? "#9ca3af"
                        : "#6b7280"
                    }
                  />
                </View>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </Text>
              )}
            </View>
          )}
        />

        {/* Course ID */}
        <Controller
          control={control}
          name="courseId"
          render={({ field: { onChange, value } }) => (
            <View className="mb-6">
              <Text className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Select your Course
              </Text>
              <View className="relative">
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  dropdownIconColor={isDark ? "#9ca3af" : "#6b7280"}
                  style={{
                    top: -5,
                    left: 25,
                    color: isDark ? "white" : "black",
                    width: "100%", // Ensure full width
                  }}
                  mode="dropdown" // Better UI on Android
                >
                  <Picker.Item label="Select a course..." value="" />
                  {courses?.map((course) => (
                    <Picker.Item
                      key={course.id}
                      label={`${course.courseCode} - ${course.courseName}`}
                      value={course.id}
                    />
                  ))}
                </Picker>

                <View className="absolute left-3.5 top-3.5">
                  <MaterialIcons
                    name="school"
                    size={20}
                    color={isDark ? "#9ca3af" : "#6b7280"}
                  />
                </View>
              </View>
            </View>
          )}
        />
        


        {/* Buttons */}
        <View className="flex-row space-x-2 ">
          <Pressable
            className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl py-3.5 items-center mr-2"
            onPress={onClose}
          >
           
            <Text className="text-gray-800 dark:text-gray-200 font-medium">
              Cancel
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 ${
              loading ? "bg-blue-500" : "bg-blue-600"
            } dark:bg-blue-500 rounded-xl py-3.5 items-center ml-2`}
            onPress={handleSubmit(onRegister)}
            disabled={loading}
          >
            <Text className="text-white font-medium">
              {loading ? "Submitting..." : "Verify & Register"}
            </Text>
          </Pressable>
        </View>

        {/* Resend OTP */}
        {/* <Pressable className="mt-4 self-center">
          <Text className="text-blue-600 dark:text-blue-400 text-sm">
            Resend OTP
          </Text>
        </Pressable> */}
        <Modal visible={isLoading} transparent={true} animationType="fade">
          <View className="flex-1 justify-center items-center bg-black/50">
            <DefaultModal isOpen={true}>
              <Text className="mb-4">Registering</Text>
              <Loading size="large" color="text-blue-500" fullScreen={false} />
            </DefaultModal>
          </View>
        </Modal>

      </View>
    </View>
  );
}
