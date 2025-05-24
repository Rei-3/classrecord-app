import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../conf/baseQuery";
import { postAttendance, postRecordAttendance } from "@/store/types/attendanceType";


export const postAttendanceApi = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath: "postAttendanceApi",
    endpoints: (builder) => ({
        postAttendance: builder.mutation<{message: string},postAttendance>({
            query: (attendance ) => ({
                url: `${process.env.EXPO_PUBLIC_POST_ATTENDANCE}`,
                method: "POST",
                body: attendance,
            }),
        }),
        posRecordAttendance: builder.mutation<{message: string},postRecordAttendance>({
            query: (attendance ) => ({
                url: `${process.env.EXPO_PUBLIC_POST_RECORD_ATTENDANCE}`,
                method: "POST",
                body: attendance,
            }),
        }),
    }),
})

export const { usePostAttendanceMutation, usePosRecordAttendanceMutation } = postAttendanceApi;