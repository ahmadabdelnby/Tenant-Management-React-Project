// ============================================
// Buildings Slice - Redux
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { buildingsService } from '../../services';

// ============================================
// Async Thunks
// ============================================

export const fetchBuildings = createAsyncThunk(
  'buildings/fetchBuildings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await buildingsService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBuildingById = createAsyncThunk(
  'buildings/fetchBuildingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await buildingsService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBuilding = createAsyncThunk(
  'buildings/createBuilding',
  async (buildingData, { rejectWithValue }) => {
    try {
      const response = await buildingsService.create(buildingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBuilding = createAsyncThunk(
  'buildings/updateBuilding',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await buildingsService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBuilding = createAsyncThunk(
  'buildings/deleteBuilding',
  async (id, { rejectWithValue }) => {
    try {
      await buildingsService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// Initial State
// ============================================

const initialState = {
  buildings: [],
  currentBuilding: null,
  pagination: null,
  isLoading: false,
  error: null,
};

// ============================================
// Buildings Slice
// ============================================

const buildingsSlice = createSlice({
  name: 'buildings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBuilding: (state) => {
      state.currentBuilding = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Buildings
      .addCase(fetchBuildings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBuildings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.buildings = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBuildings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Building By ID
      .addCase(fetchBuildingById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBuildingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBuilding = action.payload;
      })
      .addCase(fetchBuildingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Building
      .addCase(createBuilding.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBuilding.fulfilled, (state, action) => {
        state.isLoading = false;
        state.buildings.unshift(action.payload);
      })
      .addCase(createBuilding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Building
      .addCase(updateBuilding.fulfilled, (state, action) => {
        const index = state.buildings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.buildings[index] = action.payload;
        }
      })
      // Delete Building
      .addCase(deleteBuilding.fulfilled, (state, action) => {
        state.buildings = state.buildings.filter(b => b.id !== action.payload);
      });
  },
});

export const { clearError, clearCurrentBuilding } = buildingsSlice.actions;
export default buildingsSlice.reducer;
