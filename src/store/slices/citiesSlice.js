// ============================================
// Cities Slice - Redux
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { citiesService } from '../../services';

// ============================================
// Async Thunks
// ============================================

export const fetchCities = createAsyncThunk(
  'cities/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await citiesService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// Slice
// ============================================

const citiesSlice = createSlice({
  name: 'cities',
  initialState: {
    cities: [],
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default citiesSlice.reducer;
