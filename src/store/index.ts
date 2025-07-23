import { configureStore } from "@reduxjs/toolkit";
import archiveSlice from "./slices/archiveSlice";

export const store = configureStore({
  reducer: {
    archive: archiveSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
