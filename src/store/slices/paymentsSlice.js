// ============================================
// Payments Slice - Redux
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentsService } from '../../services';

// ============================================
// Async Thunks
// ============================================

export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentsService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPaymentById = createAsyncThunk(
  'payments/fetchPaymentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await paymentsService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateMonthlyPayments = createAsyncThunk(
  'payments/generateMonthly',
  async (data, { rejectWithValue }) => {
    try {
      const response = await paymentsService.generateMonthly(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePayment = createAsyncThunk(
  'payments/updatePayment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await paymentsService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPaymentLink = createAsyncThunk(
  'payments/createPaymentLink',
  async (id, { rejectWithValue }) => {
    try {
      const response = await paymentsService.createPaymentLink(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBuildingSummary = createAsyncThunk(
  'payments/fetchBuildingSummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentsService.getBuildingSummary(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// Initial State
// ============================================

const initialState = {
  payments: [],
  currentPayment: null,
  buildingSummary: null,
  pagination: null,
  isLoading: false,
  error: null,
};

// ============================================
// Payments Slice
// ============================================

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    clearBuildingSummary: (state) => {
      state.buildingSummary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payments
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Payment By ID
      .addCase(fetchPaymentById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Generate Monthly
      .addCase(generateMonthlyPayments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generateMonthlyPayments.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(generateMonthlyPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Payment
      .addCase(updatePayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      })
      // Create Payment Link
      .addCase(createPaymentLink.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPaymentLink.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createPaymentLink.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Building Summary
      .addCase(fetchBuildingSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBuildingSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.buildingSummary = action.payload;
      })
      .addCase(fetchBuildingSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentPayment, clearBuildingSummary } = paymentsSlice.actions;
export default paymentsSlice.reducer;
