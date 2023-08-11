/* eslint-disable prettier/prettier */
import { createAction, createSlice, PrepareAction } from '@reduxjs/toolkit';
import { LoginResponse } from '@app/api/FPT_3DMAP_API/Account';
import { persistUser, readUser } from '@app/services/localStorage.service';

export interface UserState {
  user: LoginResponse | null;
}

const initialState: UserState = {
  user: readUser(),
};

export const setUser = createAction<PrepareAction<LoginResponse>>('user/setUser', (newUser) => {
  persistUser(newUser);

  return {
    payload: newUser,
  };
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setUser, (state, action) => {
      state.user = action.payload;
    });
  },
});

export default userSlice.reducer;
