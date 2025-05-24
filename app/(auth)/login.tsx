import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Animated, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useForm } from 'react-hook-form';
import { string, z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useLoginUserMutation } from '@/store/api/apiSlice/auhtApiSlice';
import { setAuthToken, setFname, setLname, setRefreshToken, setUsername } from '@/lib/utils/authUtils';
import { setAuth } from '@/store/api/slices/authSlice';
import { useDispatch } from 'react-redux';
import DefaultModal from '@/components/modals/defaultModal';
import { Loading } from '@/components/custom/loading';


const loginSchema = z.object({
  username: z.string().min(1, {message: "Username is Required"}),
  password: z.string().min(1, { message: 'Password is Required' }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  const dispatch = useDispatch();

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });
  
  const [login,{isLoading}] = useLoginUserMutation();

  // Form values for input styling
  const username = watch('username');
  const password = watch('password');

  // Run entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };


  const onSubmit = async (data: LoginSchema) => {
    try{
        const response = await login(data).unwrap();
        setAuthToken(response.token);
        setRefreshToken(response.refreshToken);
        dispatch(setAuth({
          username: response.username,
          fname: response.fname,
          lname: response.lname,
          role: response.role,
          
        }))
        await setFname(response.fname);
        await setLname(response.lname);
        await setUsername(response.username);
       
        switch (response.role) {
          case "student":
            router.replace("/(protected)/(student)/dashboard");
            break;
          case "teacher":
            router.replace("/(protected)/(teacher)/dashboard");
            break;
          
          default:
            router.replace("/unauthorized");
        }
    }
    catch(err :any){
        setErrorMessage(err.data.message);
        setTimeout(() => setErrorMessage(null), 2000);

    }   
  };
  

  const backgroundColors: [string, string, string] = isDark 
    ? ['#1a1c2e', '#2d3250', '#1a1c2e'] 
    : ['#f0f5ff', '#e6f0ff', '#f0f5ff'];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient
        colors={backgroundColors}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 items-center justify-center px-6 py-10">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="w-full max-w-md"
            >
              {/* Logo/Brand */}
              <View className="items-center mb-8">
                <View className={`h-16 w-16 rounded-2xl items-center justify-center mb-3 ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`}>
                  <MaterialIcons name="lock" size={32} color="white" />
                </View>
                <Text className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                  Class Record Portal
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Sign in to access your dashboard
                </Text>
              </View>

              {/* Login Card */}
              <View className="bg-white dark:bg-gray-800 p-6 rounded-2xl h-[50vh] boxShadow">
                {/* Email Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                    Username/Id
                  </Text>
                  <View className="relative">
                    <TextInput
                      className={`border rounded-xl p-3.5 pl-11 ${
                        errors.username ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                      } ${
                        username ? 'bg-blue-50 dark:bg-gray-750' : 'bg-gray-50 dark:bg-gray-700'
                      } text-gray-900 dark:text-dark`}
                      placeholder="username/ID"
                      placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
                      keyboardType="default"
                      autoCapitalize="none"
                      onChangeText={(text) => setValue('username', text)}
                    />
                    <View className="absolute left-3.5 top-3.5">
                      <MaterialIcons 
                        name="mood" 
                        size={20} 
                        color={errors.username ? '#ef4444' : isDark ? '#9ca3af' : '#6b7280'} 
                      />
                    </View>
                  </View>
                  {errors.username && (
                    <Text className="text-red-500 text-xs mt-1">{errors.username.message}</Text>
                  )}
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <Text className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                    Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      className={`border rounded-xl p-3.5 pl-11 ${
                        errors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                      } ${
                        password ? 'bg-blue-50 dark:bg-gray-750' : 'bg-gray-50 dark:bg-gray-700'
                      } text-gray-900 dark:text-dark pr-11`}
                      placeholder="••••••••"
                      placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
                      secureTextEntry={!showPassword}
                      onChangeText={(text) => setValue('password', text)}
                    />
                    <View className="absolute left-3.5 top-3.5">
                      <MaterialIcons 
                        name="lock" 
                        size={20} 
                        color={errors.password ? '#ef4444' : isDark ? '#9ca3af' : '#6b7280'} 
                      />
                    </View>
                    <TouchableOpacity 
                      className="absolute right-3.5 top-3.5"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialIcons 
                        name={showPassword ? "visibility" : "visibility-off"} 
                        size={20} 
                        color={isDark ? '#9ca3af' : '#6b7280'} 
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text className="text-red-500 text-xs mt-1">{errors.password.message}</Text>
                  )}
                </View>

                {/* Forgot Password */}
                <TouchableOpacity className="mb-6 self-end">
                  <Text className="text-blue-600 dark:text-blue-400 text-sm">
                    Forgot password?
                  </Text>
                </TouchableOpacity>

                {/* Error Message */}
                {errorMessage && (
                  <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <Text className="text-sm">{errorMessage}</Text>
                  </View>
                )}
            
                {/* Login Button */}
                <Animated.View
                  style={{
                    transform: [{ scale: buttonScale }],
                  }}
                >
                  <Pressable
                    className={`${
                      loading ? 'bg-blue-500' : 'bg-blue-600'
                    } dark:bg-blue-500 rounded-xl py-3.5 items-center mb-4`}
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                  >
                    <Text className="text-white font-semibold text-base">
                      {loading ? 'Authenticating...' : 'Sign In'}
                    </Text>
                  </Pressable>
                </Animated.View>

                {/* Register Option */}
                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-600 dark:text-gray-400">
                    Don't have an account?
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/register')} className="ml-1">
                    <Text className="text-blue-600 dark:text-blue-400 font-medium">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Enterprise Features */}
              <View className="mt-6">
                <View className="flex-row justify-between">
                  <View className="flex-row items-center">
                    <MaterialIcons name="security" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                       Security Guard
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons name="verified-user" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ISO 27001 Certified
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
          
          <Modal visible={isLoading} transparent={true} animationType="fade">
          <View className="flex-1 justify-center items-center bg-black/50">
            <DefaultModal isOpen={true}>
              <Text className="mb-4">Logging In</Text>
              <Loading size="large" color="text-blue-500" fullScreen={false} />
            </DefaultModal>
          </View>
        </Modal>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}