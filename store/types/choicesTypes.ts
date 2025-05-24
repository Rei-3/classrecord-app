export interface Courses {
    id: string;
    courseCode: string;
    courseName: string;
}

export interface Terms {
    id: number;
    termType: string;
}

export interface GradingComposition {
   teachingLoadDetailId: number;
    composition: Composition[];
}

 interface Composition {
    id: number;
    percentage: number;
    category: Category;
}

export interface Category {
    id: number;
    categoryName: string;
}
