// ============================================
// Redux Store Configuration
// ============================================

import { configureStore } from '@reduxjs/toolkit';
import {
  authReducer,
  usersReducer,
  buildingsReducer,
  unitsReducer,
  tenanciesReducer,
  maintenanceReducer,
  uiReducer,
} from './slices';

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    buildings: buildingsReducer,
    units: unitsReducer,
    tenancies: tenanciesReducer,
    maintenance: maintenanceReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
});

export default store;
