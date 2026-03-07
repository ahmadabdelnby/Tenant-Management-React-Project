// ============================================
// Redux Store Configuration
// ============================================

import { configureStore } from '@reduxjs/toolkit';
import {
  authReducer,
  usersReducer,
  buildingsReducer,
  citiesReducer,
  unitsReducer,
  tenanciesReducer,
  maintenanceReducer,
  paymentsReducer,
  notificationsReducer,
  uiReducer,
} from './slices';

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    buildings: buildingsReducer,
    cities: citiesReducer,
    units: unitsReducer,
    tenancies: tenanciesReducer,
    maintenance: maintenanceReducer,
    payments: paymentsReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
});

export default store;
