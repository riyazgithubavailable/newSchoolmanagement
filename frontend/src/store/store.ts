import { configureStore } from "@reduxjs/toolkit";

import processingReducer from "./reducer";

export const store = configureStore({
    reducer: {
        processing: processingReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;