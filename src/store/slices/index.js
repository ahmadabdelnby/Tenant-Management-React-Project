// ============================================
// Slices Index - Export all slices
// ============================================

export { default as authReducer } from './authSlice';
export { default as usersReducer } from './usersSlice';
export { default as buildingsReducer } from './buildingsSlice';
export { default as unitsReducer } from './unitsSlice';
export { default as tenanciesReducer } from './tenanciesSlice';
export { default as maintenanceReducer } from './maintenanceSlice';
export { default as uiReducer } from './uiSlice';

// Re-export actions
export * from './authSlice';
export * from './usersSlice';
export * from './buildingsSlice';
export * from './unitsSlice';
export * from './tenanciesSlice';
export * from './maintenanceSlice';
export * from './uiSlice';
