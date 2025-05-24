import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../conf/baseQuery";
import {
  EnrollementHash,
  ScoresPerCat,
  SemGrades,
  SubjectsEnrolled,
  TermGrades,
} from "@/store/types/students";
import { GradingComposition } from "@/store/types/choicesTypes";

export const getSubjectsEnrolledApiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "getSubjectsEnrolledApi",
  endpoints: (builder) => ({
    getSubjectsEnrolled: builder.query<SubjectsEnrolled[], void>({
      query: () => ({
        url: `${process.env.EXPO_PUBLIC_GET_SUBJECTS_ENROLLED}`,
        method: "GET",
      }),
    }),
    getSubjectTermGrades: builder.query<
      TermGrades,
      { teachingLoadDetailId: number; termId: number }
    >({
      query: ({ teachingLoadDetailId, termId }) => ({
        url: `${process.env.EXPO_PUBLIC_GET_STUDENT_TERM_GRADE}/${teachingLoadDetailId}/${termId}`,
        method: "GET",
      }),
    }),
    getSubjectSemGrades: builder.query<
      SemGrades,
      { teachingLoadDetailId: number }
    >({
      query: ({ teachingLoadDetailId }) => ({
        url: `${process.env.EXPO_PUBLIC_GET_STUDENT_SEM_GRADE}/${teachingLoadDetailId}`,
        method: "GET",
      }),
    }),
    getGradingCompositon: builder.query<
      GradingComposition,
      { teachingLoadDetailId: number }
    >({
      query: ({ teachingLoadDetailId }) => ({
        url: `${process.env.EXPO_PUBLIC_GET_GRADING_COMPOSITION}/${teachingLoadDetailId}`,
        method: "GET",
      }),
    }),
    getScoresPerCategory: builder.query<
      ScoresPerCat[],
      {
        teachingLoadDetailId: number;
        termId: number;
        categoryId: number;
      }
    >({
      query: ({ teachingLoadDetailId, termId, categoryId }) => ({
        url: `${process.env.EXPO_PUBLIC_GET_SCORES_PER_CATEGORY}/${teachingLoadDetailId}/${termId}/${categoryId}`,
        method: "GET",
      }),
    }),
    postEnrollSubject: builder.mutation<{ message: string }, EnrollementHash>({
      query: (hashKey) => ({
        url: `${process.env.EXPO_PUBLIC_POST_ENROLL_SUBJECT}`,
        method: "POST",
        body: hashKey,
      }),
    }),
    getStudentInfo: builder.query<any, void>({
      query: () => ({
        url: `${process.env.EXPO_PUBLIC_GET_STUDENT_INFO}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetSubjectsEnrolledQuery,
  useGetSubjectTermGradesQuery,
  useGetSubjectSemGradesQuery,
  useGetGradingCompositonQuery,
  usePostEnrollSubjectMutation,
  useGetScoresPerCategoryQuery,
  useGetStudentInfoQuery
} = getSubjectsEnrolledApiSlice;
