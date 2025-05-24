import { Category, Courses, Terms } from "@/store/types/choicesTypes";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../conf/baseQuery";
import { Sem } from "@/store/types/teachingLoadTypes";

export const getCourseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getCourses: builder.query<Courses[], void>({
      query: () => ({
        url: `${process.env.EXPO_PUBLIC_GET_COURSE}`,
        method: "GET",
      }),
    }),
    getSem: builder.query<Sem[], void>({
      query: () => ({
        url: `${process.env.EXPO_PUBLIC_SEM}`,
        method: "GET",
      }),
    }),
    getTerm: builder.query<Terms[], void>({
        query: () => ({
            url: `${process.env.EXPO_PUBLIC_GET_TERM}`,
            method: "GET",
        }),
    }),
    getCategory: builder.query <Category[], void>({
        query: () => ({
            url: `${process.env.EXPO_PUBLIC_GET_CATEGORY}`,
            method: "GET",
        }),
    }),
  }),
});

export const {
  useGetCoursesQuery, 
  useGetSemQuery, 
  useGetTermQuery,
  useGetCategoryQuery,
  
} = getCourseApi;
