import { createSlice } from "@reduxjs/toolkit";

interface SearchState {
    searchValue: string;
}

const initialState: SearchState = {
    searchValue: "",
};

export const searchSlice = createSlice ({
    name: "search",
    initialState,
    reducers: {
        setSearchValue: (state, action) => {
            state.searchValue = action.payload;
        },
        clearSearchValue: (state) => {
            state.searchValue = "";
        },
    },  
});

export const { setSearchValue, clearSearchValue } = searchSlice.actions;
export default searchSlice.reducer;