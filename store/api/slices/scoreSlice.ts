import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RecordScore } from "../types/classRecord";

interface ScoreState {
    scores: RecordScore[];
}

const initialState: ScoreState = {
    scores: [],
};

const scoreSlice = createSlice({
    name: "score",
    initialState,
    reducers: {
        setScores: (state, action: PayloadAction<RecordScore>) => {
            const index = state.scores.findIndex(
                s => s.enrollmentId === action.payload.enrollmentId && 
                s.gradingId === action.payload.gradingId
            );

            if (index !== -1) {
                state.scores[index].score = action.payload.score;
            }else {
                state.scores.push(action.payload);
            }
        },

        removeScore: (state, action: PayloadAction<{ enrollmentId: number; gradingId: number }>) => {
           state.scores = state.scores.filter(
            s=> !(
                s.enrollmentId === action.payload.enrollmentId &&
                s.gradingId === action.payload.gradingId
            )
           )
        },
        clearScores: (state) => {
            state.scores = [];
        },
    },
});

export const { setScores, removeScore, clearScores } = scoreSlice.actions;
export default scoreSlice.reducer;