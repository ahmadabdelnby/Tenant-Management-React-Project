// ============================================
// Units Slice - Redux
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { unitsService } from '../../services';

// ============================================
// Async Thunks
// ============================================

export const fetchUnits = createAsyncThunk(
  'units/fetchUnits',
  async (params, { rejectWithValue }) => {
    try {
      const response = await unitsService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUnitById = createAsyncThunk(
  'units/fetchUnitById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await unitsService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUnit = createAsyncThunk(
  'units/createUnit',
  async (unitData, { rejectWithValue }) => {
    try {
      const response = await unitsService.create(unitData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUnit = createAsyncThunk(
  'units/updateUnit',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await unitsService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUnit = createAsyncThunk(
  'units/deleteUnit',
  async (id, { rejectWithValue }) => {
    try {
      await unitsService.delete(id);
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
  units: [],
  currentUnit: null,
  pagination: null,
  isLoading: false,
  error: null,
};

// ============================================
// Units Slice
// ============================================

const unitsSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUnit: (state) => {
      state.currentUnit = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Units
      .addCase(fetchUnits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.units = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Unit By ID
      .addCase(fetchUnitById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUnitById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUnit = action.payload;
      })
      .addCase(fetchUnitById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Unit
      .addCase(createUnit.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.units.unshift(action.payload);
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Unit
      .addCase(updateUnit.fulfilled, (state, action) => {
        const index = state.units.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.units[index] = action.payload;
        }
      })
      // Delete Unit
      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.units = state.units.filter(u => u.id !== action.payload);
      });
  },
});

export const { clearError, clearCurrentUnit } = unitsSlice.actions;
export default unitsSlice.reducer;
