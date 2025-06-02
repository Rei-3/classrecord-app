import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: "classrecord-app",
  slug: "classrecord-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/logo-icon.png",
  scheme: "classrecordapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: false,
  splash: {
    image: "./assets/images/logo-icon.png",
    resizeMode: "contain",
    backgroundColor: "#FFFFFF"
  },
  doctor: {
    reactNativeDirectoryCheck: {
      exclude: [
        "jwt-decode",
        "@hookform/resolvers",
        "expo-modules-autolinking"
      ],
      listUnknownPackages: false
    }
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.assookkaa.classrecordapp",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/logo-icon.png",
      backgroundColor: "#FFFFFF"
    },
    edgeToEdgeEnabled: true,
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO"
    ],
    package: "com.assookkaa.classrecordapp"
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/logo.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera."
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {},
    eas: {
      projectId: "17dbde92-764e-493d-b53c-5d9adee89cd7"
    },

    // 🔐 PRIVATE ENV from EAS dashboard or .env
    apiKey: process.env.API_KEY,
    secretKey: process.env.API_SECRET,

    // 🌐 PUBLIC ENV
    baseEndpoint: process.env.PUBLIC_BASE_ENDPOINT,
    
    auth: {
      login: process.env.EXPO_PUBLIC_LOGIN,
      registerStudent: process.env.EXPO_PUBLIC_REGISTER_STUDENT,
      registerUsername: process.env.EXPO_PUBLIC_REGISTER_USERNAME,
      refreshToken: process.env.EXPO_PUBLIC_REFRESH_TOKEN,
      refresh: process.env.EXPO_PUBLIC_REFRESH,
    },
  
    // Teacher Endpoints
    teacher: {
      teachingLoad: process.env.EXPO_PUBLIC_GET_TEACHING_LOAD,
      viewEnrolled: process.env.EXPO_PUBLIC_VIEW_ENROLLED,
      attendanceList: process.env.EXPO_PUBLIC_GET_ATTENDANCE_LIST,
      teacherInfo: process.env.EXPO_PUBLIC_GET_TEACHER_INFO,
      postAttendance: process.env.EXPO_PUBLIC_POST_ATTENDANCE,
      recordAttendance: process.env.EXPO_PUBLIC_POST_RECORD_ATTENDANCE,
    },
  
    // Student Endpoints
    student: {
      termGrade: process.env.EXPO_PUBLIC_GET_STUDENT_TERM_GRADE,
      semGrade: process.env.EXPO_PUBLIC_GET_STUDENT_SEM_GRADE,
      enrolledSubjects: process.env.EXPO_PUBLIC_GET_SUBJECTS_ENROLLED,
      scoresPerCategory: process.env.EXPO_PUBLIC_GET_SCORES_PER_CATEGORY,
      studentInfo: process.env.EXPO_PUBLIC_GET_STUDENT_INFO,
      enrollSubject: process.env.EXPO_PUBLIC_POST_ENROLL_SUBJECT,
    },
  
    // Public Endpoints
    public: {
      gradingComposition: process.env.EXPO_PUBLIC_GET_GRADING_COMPOSITION,
    },
  
    // Choices Endpoints
    choices: {
      semesters: process.env.EXPO_PUBLIC_SEM,
      courses: process.env.EXPO_PUBLIC_GET_COURSE,
      terms: process.env.EXPO_PUBLIC_GET_TERM,
      categories: process.env.EXPO_PUBLIC_GET_CATEGORY,
    },
    
  },
  runtimeVersion: {
    policy: "appVersion"
  },
  updates: {
    url: "https://u.expo.dev/17dbde92-764e-493d-b53c-5d9adee89cd7"
  }
});
