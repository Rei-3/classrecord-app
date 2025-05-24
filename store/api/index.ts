import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authApi } from "./apiSlice/auhtApiSlice";
import { getCourseApi } from "./apiSlice/getApi/courseApiSlice";
import { authSlice } from "./slices/authSlice";
import { getTeachingLoadApiSlice } from "./apiSlice/getApi/teacher/teachingLoadApiSlice";
import { postAttendanceApi } from "./apiSlice/postApi/teacher/attendanceSlice";
import { getAttendanceApiSlice } from "./apiSlice/getApi/teacher/attendanceSlice";
import { getSubjectsEnrolledApiSlice } from "./apiSlice/getApi/student/subjectsEnrolledApiSlice";





const rootReducer = combineReducers({
    // Add your reducers here
    // Example: auth: authReducer,
    auth: authSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    //post
    [postAttendanceApi.reducerPath]: postAttendanceApi.reducer,
    //get
    [getTeachingLoadApiSlice.reducerPath]: getTeachingLoadApiSlice.reducer,
    [getCourseApi.reducerPath]: getCourseApi.reducer,
    [getAttendanceApiSlice.reducerPath]: getAttendanceApiSlice.reducer,

    //studesnt
    [getSubjectsEnrolledApiSlice.reducerPath]: getSubjectsEnrolledApiSlice.reducer,
    });


export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware(
           
        ).concat(
            authApi.middleware,
            //post
            postAttendanceApi.middleware,
            
            //get
            getTeachingLoadApiSlice.middleware,
            getCourseApi.middleware,
            getAttendanceApiSlice.middleware,

            //student
            getSubjectsEnrolledApiSlice.middleware,
        ),
    devTools: process.env.NODE_ENV !== "production",
})


export type IRootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;