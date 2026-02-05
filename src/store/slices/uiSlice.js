// ============================================
// UI Slice - Redux (for notifications, modals, etc.)
// ============================================

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  notification: null,
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    showNotification: (state, action) => {
      state.notification = {
        type: action.payload.type || 'info', // success, error, warning, info
        message: action.payload.message,
        duration: action.payload.duration || 5000,
      };
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    openModal: (state, action) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: null,
      };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  showNotification,
  clearNotification,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
