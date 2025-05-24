// import { IRootState } from "@/store/api";
// import { router } from "expo-router";
// import { useEffect } from "react";
// import { useSelector } from "react-redux";

// export const useAuthGuard = () => {
//     const isAuthenticated = useSelector((state: IRootState) => state.auth.isAuthenticated);
//     const role = useSelector((state: IRootState) => state.auth.role);

//     useEffect(() => {
//         if (isAuthenticated) {
//             // Redirect to the home page of their role
//             if (role === 'teacher') {
//                 router.replace('/(protected)/(teacher)/index');
//             } else if (role === 'student') {
//                 router.replace('/(protected)/(student)/dashboard');
//             }
//         } else {
//             // Redirect to login page if not authenticated
//             router.replace('/login');
//         }
//     }, [isAuthenticated, role]);
    
//     return isAuthenticated;
// }
