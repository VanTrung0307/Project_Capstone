/* eslint-disable prettier/prettier */
import { LoginRequest, loginAdmin } from '@app/api/FPT_3DMAP_API/Account';
import { deleteToken, deleteUser, persistToken, readToken } from '@app/services/localStorage.service';
import { setUser } from '@app/store/slices/userSlice';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface AuthSlice {
  token: string | null;
}

const initialState: AuthSlice = {
  token: readToken(),
};

export const doLogin = createAsyncThunk('auth/doLogin', async (loginPayload: LoginRequest, { dispatch }) => {
  try {
    const response = await loginAdmin(loginPayload);

    if ('studentId' in response && 'token' in response) {
      dispatch(setUser(response.studentId));

      persistToken(response.token);

      return response.token;
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    throw error;
  }
});

export const doLogout = createAsyncThunk('auth/doLogout', (payload, { dispatch }) => {
  deleteToken();
  deleteUser();
  dispatch(setUser(null));
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(doLogin.fulfilled, (state, action) => {
      state.token = action.payload;
    });
    builder.addCase(doLogout.fulfilled, (state) => {
      state.token = '';
    });
  },
});

export default authSlice.reducer;
