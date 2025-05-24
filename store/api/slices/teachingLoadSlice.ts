import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SubjectPost, Subjects } from "../types/choices";

interface TeachingLoadState {
  subjects: SubjectPost[]; // renamed for clarity
  loading: boolean;
  error: string | null;
  SelectedDays : string[];
  
}

const initialState: TeachingLoadState = {
  subjects: [],
  loading: false,
  error: null,
  SelectedDays: []
};

let nextId = 1; 

const teachingLoadSlice = createSlice({
  name: "teachingLoad",
  initialState,
  reducers: {
    addSubject: (state, action: PayloadAction<SubjectPost>) => {
      state.subjects.push({
        id: nextId ++,
        SubjectId: action.payload.SubjectId,
        schedule: action.payload.schedule,
        section: action.payload.section,
      });
    },
    removeSubject: (state, action: PayloadAction<number>) => {
      state.subjects = state.subjects.filter(
        (subject) => subject.id !== action.payload // assuming subjectId is the key
      );
    },
    fetchSubjectsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSubjectsSuccess: (state, action: PayloadAction<SubjectPost[]>) => {
      state.loading = false;
      state.subjects = action.payload;
    },
    fetchSubjectsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetSubjects: (state) => {
      state.subjects = [];
      state.loading = false;
      state.error = null;
    },
    //Days

    addSelectedDay: (state, action: PayloadAction<string>) => {
      const day = action.payload;
      if (state.SelectedDays.includes(day)) {
        state.SelectedDays = state.SelectedDays.filter((d) => d !== day);
      }
      else {
        state.SelectedDays.push(day);
      }
    },
    removeSelectedDay: (state, action: PayloadAction<string>) => {
      state.SelectedDays = state.SelectedDays.filter(day => day !== action.payload);
    },
    clearSelectedDays: (state) => {
      state.SelectedDays = [];
    },
    setSelectedDays: (state, action: PayloadAction<string[]>) => {
      state.SelectedDays = action.payload;
    }
  },
});

export const {
  addSubject,
  removeSubject,
  fetchSubjectsStart,
  fetchSubjectsSuccess,
  fetchSubjectsFailure,
  resetSubjects,
  //Days
  addSelectedDay,
  clearSelectedDays,
  removeSelectedDay,
  setSelectedDays,
} = teachingLoadSlice.actions;

export default teachingLoadSlice.reducer;

