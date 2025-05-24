import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../conf/baseQuery";
import { getAttendanceList } from "@/store/types/attendanceType";

export const getAttendanceApiSlice = createApi ({
    baseQuery: baseQueryWithReauth,
    reducerPath: "getAttendanceApi",
    endpoints: (builder) => ({
        getAttendance: builder.query<getAttendanceList[], { teachingLoadDetailId: number, termId: number }>({
            query: ({ teachingLoadDetailId, termId }) => ({
                url: `${process.env.EXPO_PUBLIC_GET_ATTENDANCE_LIST}/${teachingLoadDetailId}/${termId}`,
                method: "GET",
            }),
        }),
    }),
})
export const { useGetAttendanceQuery } = getAttendanceApiSlice;