import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../conf/baseQuery";
import { Enrolled, TeachingLoad } from "@/store/types/teachingLoadTypes";

export const getTeachingLoadApiSlice = createApi({
  reducerPath: "getTeachingLoadApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getTeachingLoad: builder.query<TeachingLoad[], void>({
      query: () => ({
        url: `${process.env.EXPO_PUBLIC_GET_TEACHING_LOAD}`,
        method: "GET",
      }),
    }),
    getEnrolled: builder.query<Enrolled[], {teachingLoadDetailId: number}>({
      query: ({teachingLoadDetailId}) => ({
        url: `${process.env.EXPO_PUBLIC_VIEW_ENROLLED}/${teachingLoadDetailId}`,
        method: "GET",
      }),
    }),
    getTeacherInfo : builder.query<any, void>({
      query: () => ({
        url: `${process.env.EXPO_PUBLIC_GET_TEACHER_INFO}`,
        method: "GET",
      }),
    })
  }),
});

export const { 
    useGetTeachingLoadQuery,
    useGetEnrolledQuery,
    useGetTeacherInfoQuery
} = getTeachingLoadApiSlice;
