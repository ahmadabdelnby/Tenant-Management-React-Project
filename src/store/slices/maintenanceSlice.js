// ============================================
// Maintenance Slice - Redux State Management
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { maintenanceService } from '../../services';

// Async Thunks
export const fetchMaintenanceRequests = createAsyncThunk(
  'maintenance/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.getAll(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch maintenance requests');
    }
  }
);

export const fetchMaintenanceById = createAsyncThunk(
  'maintenance/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch maintenance request');
    }
  }
);

export const createMaintenanceRequest = createAsyncThunk(
  'maintenance/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create maintenance request');
    }
  }
);

export const updateMaintenanceRequest = createAsyncThunk(
  'maintenance/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update maintenance request');
    }
  }
);

export const deleteMaintenanceRequest = createAsyncThunk(
  'maintenance/delete',
  async (id, { rejectWithValue }) => {
    try {
      await maintenanceService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete maintenance request');
    }
  }
);

// Initial state
const initialState = {
  requests: [],
  currentRequest: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

// Slice
const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchMaintenanceRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaintenanceRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchMaintenanceRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchMaintenanceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaintenanceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRequest = action.payload;
      })
      .addCase(fetchMaintenanceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createMaintenanceRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMaintenanceRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests.unshift(action.payload);
      })
      .addCase(createMaintenanceRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateMaintenanceRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMaintenanceRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        if (state.currentRequest?.id === action.payload.id) {
          state.currentRequest = action.payload;
        }
      })
      .addCase(updateMaintenanceRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteMaintenanceRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMaintenanceRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = state.requests.filter((r) => r.id !== action.payload);
      })
      .addCase(deleteMaintenanceRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentRequest, clearError } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
