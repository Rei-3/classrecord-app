export interface TeachingLoad {
    id: number;
    semId: number;
    status: boolean;
    addedOn: string;
    academicYear: string;
    teachingLoadId: TeachingLoadDetail[];
  }
  
  export interface TeachingLoadDetail {
    id: number;
    key: string;
    schedule: string; // JWT token (likely an error)
    section: string;
    subjects: Subject;
  }
  
  export interface Subject {
    id: number;
    subjectDesc: string;
    subjectName: string;
    units: number;
  }

  export interface Enrolled {
    enrollmentId: number;
    studentId: number;
    name: string;
    gender: boolean;
    email: string;
  }
  export interface Sem {
    createdAt: any;
    id: number;
    semName: string;
}
  
  