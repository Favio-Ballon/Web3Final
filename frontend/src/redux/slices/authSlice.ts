import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the slice state
interface AuthState {
  email: string | null;
  rol?: string;
  first_name?: string;
  last_name?: string;
  isInitialized: boolean; // Para controlar si la auth se ha inicializado
}

// Define the initial state using that type
const initialState: AuthState = {
  email: null,
  rol: undefined,
  first_name: undefined,
  last_name: undefined,
  isInitialized: false,
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
      state.isInitialized = true;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    updateUserRole: (state, action: PayloadAction<string>) => {
      state.rol = action.payload;
    },
    updateUserProfile: (
      state,
      action: PayloadAction<{
        rol?: string;
        first_name?: string;
        last_name?: string;
      }>
    ) => {
      if (action.payload.rol !== undefined) {
        state.rol = action.payload.rol;
      }
      if (action.payload.first_name !== undefined) {
        state.first_name = action.payload.first_name;
      }
      if (action.payload.last_name !== undefined) {
        state.last_name = action.payload.last_name;
      }
    },
    logoutUser: (state) => {
      state.email = null;
      state.rol = undefined;
      state.first_name = undefined;
      state.last_name = undefined;
      state.isInitialized = true; // Mantener inicializado después del logout
    },
  },
});

export const {
  loginUser,
  updateUserRole,
  updateUserProfile,
  logoutUser,
  setInitialized,
} = authSlice.actions;

export default authSlice.reducer;
