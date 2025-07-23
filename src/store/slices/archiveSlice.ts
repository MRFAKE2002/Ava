import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IArchiveFile } from "../../types/APIType";

interface IArchiveState {
  // داده‌های اصلی
  files: IArchiveFile[];
  totalCount: number;
  currentPage: number;
  totalPages: number;

  // UI states
  expandedRow: number | null;

  // loading states
  loading: boolean;
  error: string | null;

  // states مربوط به هر فایل جداگانه
  fileStates: {
    [fileId: number]: {
      textMode: "simple" | "timed";
      currentTime: number;
      deleteLoading: boolean;
      copySuccess: boolean;
    };
  };
}

const initialState: IArchiveState = {
  files: [],
  totalCount: 0,
  currentPage: 1,
  totalPages: 0,
  expandedRow: null,
  loading: false,
  error: null,
  fileStates: {},
};

const archiveSlice = createSlice({
  name: "archive",
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<IArchiveFile[]>) => {
      state.files = action.payload;
    },

    setTotalCount: (state, action: PayloadAction<number>) => {
      state.totalCount = action.payload;
    },

    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    setTotalPages: (state, action: PayloadAction<number>) => {
      state.totalPages = action.payload;
    },

    setExpandedRow: (state, action: PayloadAction<number | null>) => {
      state.expandedRow = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setFileTextMode: (
      state,
      action: PayloadAction<{ fileId: number; mode: "simple" | "timed" }>
    ) => {
      const { fileId, mode } = action.payload;

      if (!state.fileStates[fileId]) {
        state.fileStates[fileId] = {
          textMode: "simple",
          currentTime: 0,
          deleteLoading: false,
          copySuccess: false,
        };
      }

      state.fileStates[fileId].textMode = mode;
    },

    setFileCurrentTime: (
      state,
      action: PayloadAction<{ fileId: number; time: number }>
    ) => {
      const { fileId, time } = action.payload;

      if (!state.fileStates[fileId]) {
        state.fileStates[fileId] = {
          textMode: "simple",
          currentTime: 0,
          deleteLoading: false,
          copySuccess: false,
        };
      }

      state.fileStates[fileId].currentTime = time;
    },

    setFileDeleteLoading: (
      state,
      action: PayloadAction<{ fileId: number; loading: boolean }>
    ) => {
      const { fileId, loading } = action.payload;

      if (!state.fileStates[fileId]) {
        state.fileStates[fileId] = {
          textMode: "simple",
          currentTime: 0,
          deleteLoading: false,
          copySuccess: false,
        };
      }

      state.fileStates[fileId].deleteLoading = loading;
    },

    setFileCopySuccess: (
      state,
      action: PayloadAction<{ fileId: number; success: boolean }>
    ) => {
      const { fileId, success } = action.payload;

      if (!state.fileStates[fileId]) {
        state.fileStates[fileId] = {
          textMode: "simple",
          currentTime: 0,
          deleteLoading: false,
          copySuccess: false,
        };
      }

      state.fileStates[fileId].copySuccess = success;
    },

    removeFile: (state, action: PayloadAction<number>) => {
      const fileId = action.payload;
      state.files = state.files.filter((file) => file.id !== fileId);
      delete state.fileStates[fileId];
      state.totalCount -= 1;
    },
  },
});

export const {
  setFiles,
  setTotalCount,
  setCurrentPage,
  setTotalPages,
  setExpandedRow,
  setLoading,
  setError,
  setFileTextMode,
  setFileCurrentTime,
  setFileDeleteLoading,
  setFileCopySuccess,
  removeFile,
} = archiveSlice.actions;

export default archiveSlice.reducer;

// Selectors
export const selectFiles = (state: { archive: IArchiveState }) =>
  state.archive.files;
export const selectTotalCount = (state: { archive: IArchiveState }) =>
  state.archive.totalCount;
export const selectCurrentPage = (state: { archive: IArchiveState }) =>
  state.archive.currentPage;
export const selectTotalPages = (state: { archive: IArchiveState }) =>
  state.archive.totalPages;
export const selectExpandedRow = (state: { archive: IArchiveState }) =>
  state.archive.expandedRow;
export const selectLoading = (state: { archive: IArchiveState }) =>
  state.archive.loading;
export const selectError = (state: { archive: IArchiveState }) =>
  state.archive.error;

export const selectFileState =
  (fileId: number) => (state: { archive: IArchiveState }) => {
    return (
      state.archive.fileStates[fileId] || {
        textMode: "simple" as const,
        currentTime: 0,
        deleteLoading: false,
        copySuccess: false,
      }
    );
  };
