import { createSlice } from "@reduxjs/toolkit";

const initialState = {
     isPopUpOpen: false
}
export const processingState = createSlice({
    name: "processing",
    initialState,
    reducers: {
        setIsPopUpOpen: (state, action) => {
            state.isPopUpOpen = action.payload
        }
    }
})
export const { setIsPopUpOpen } = processingState.actions;
export default processingState.reducer;