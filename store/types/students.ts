export interface SubjectsEnrolled {
    teachingLoadDetailId: number;
    subjectDesc: string;
    subjectName: string;
    status: boolean;
    academicYear: string;
    semName: string;
    teacher: string;
    section: string;
    schedule: string;
}

export interface TermGrades {
    studentId: number;
    name: string;
    scores: Score[]
    finalGrade: number;
    remarks: string;
}

interface Score {
    quiz: number;
    activity: number;
    exam: number;
    attendance: number;
}

export interface SemGrades {
  
    studentId: number;
    studentName: string;
    termGrades: TermType
    semesterGrade: number;
    message: string;
}

interface TermType {
    Midterm: number;
    Final: number;
}

export interface ScoresPerCat {
    gradingId: number;
    gradingDetailId: number;
    enrollmentId: number;
    description: string | null;
    conductedOn: Date;
    numberOfItems: number;
    score: number;
    recordedOn: Date ;
}

export interface EnrollementHash {
    hashKey: string;
}