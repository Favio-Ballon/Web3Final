import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the slice state
interface AuthState {
  email: string | null;
  rol?: string;
  first_name?: string;
  last_name?: string;
}

// Define the initial state using that type
const initialState: AuthState = {
  email: null,
  rol: undefined,
  first_name: undefined,
  last_name: undefined,
};

export const authSlice = createSlice({
  name: "counter",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    loginUser: (
      state,
      action: PayloadAction<{
        email: string;
        rol?: string;
        first_name?: string;
        last_name?: string;
      }>
    ) => {
      state.email = action.payload.email;
      state.rol = action.payload.rol;
      state.first_name = action.payload.first_name;
      state.last_name = action.payload.last_name;
    },
    logoutUser: (state) => {
      state.email = null;
      state.rol = undefined;
      state.first_name = undefined;
      state.last_name = undefined;
    },
  },
});

export const { loginUser, logoutUser } = authSlice.actions;

export default authSlice.reducer;
