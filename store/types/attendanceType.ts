export interface getAttendanceList {
  id: number;
  description: string;
  numberOfItems: number;
  date: string;
}

export interface postAttendance {
  teachingLoadDetailId: number;
  termId: number;
}

export interface postRecordAttendance {
  teachingLoadDetailId: number;
  termId: number;
  studentId: number;
}
