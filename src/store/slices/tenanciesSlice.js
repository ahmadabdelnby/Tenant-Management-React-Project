// ============================================
// Tenancies Slice - Redux
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tenanciesService } from '../../services';

// ============================================
// Async Thunks
// ============================================

export const fetchTenancies = createAsyncThunk(
  'tenancies/fetchTenancies',
  async (params, { rejectWithValue }) => {
    try {
      const response = await tenanciesService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTenancyById = createAsyncThunk(
  'tenancies/fetchTenancyById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tenanciesService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyTenancies = createAsyncThunk(
  'tenancies/fetchMyTenancies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tenanciesService.getMyTenancies();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTenancy = createAsyncThunk(
  'tenancies/createTenancy',
  async (tenancyData, { rejectWithValue }) => {
    try {
      const response = await tenanciesService.create(tenancyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTenancy = createAsyncThunk(
  'tenancies/updateTenancy',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await tenanciesService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const endTenancy = createAsyncThunk(
  'tenancies/endTenancy',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await tenanciesService.end(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTenancy = createAsyncThunk(
  'tenancies/deleteTenancy',
  async (id, { rejectWithValue }) => {
    try {
      await tenanciesService.delete(id);
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
  tenancies: [],
  myTenancies: [],
  currentTenancy: null,
  pagination: null,
  isLoading: false,
  error: null,
};

// ============================================
// Tenancies Slice
// ============================================

const tenanciesSlice = createSlice({
  name: 'tenancies',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTenancy: (state) => {
      state.currentTenancy = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tenancies
      .addCase(fetchTenancies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenancies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenancies = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTenancies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch My Tenancies
      .addCase(fetchMyTenancies.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyTenancies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myTenancies = action.payload;
      })
      .addCase(fetchMyTenancies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Tenancy By ID
      .addCase(fetchTenancyById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTenancyById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTenancy = action.payload;
      })
      .addCase(fetchTenancyById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Tenancy
      .addCase(createTenancy.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTenancy.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenancies.unshift(action.payload);
      })
      .addCase(createTenancy.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Tenancy
      .addCase(updateTenancy.fulfilled, (state, action) => {
        const index = state.tenancies.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tenancies[index] = action.payload;
        }
      })
      // End Tenancy
      .addCase(endTenancy.fulfilled, (state, action) => {
        const index = state.tenancies.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tenancies[index] = action.payload;
        }
      })
      // Delete Tenancy
      .addCase(deleteTenancy.fulfilled, (state, action) => {
        state.tenancies = state.tenancies.filter(t => t.id !== action.payload);
      });
  },
});

export const { clearError, clearCurrentTenancy } = tenanciesSlice.actions;
export default tenanciesSlice.reducer;
