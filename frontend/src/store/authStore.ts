// frontend/src/store/authStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "../api/axios";
import type {
  AuthState,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth.types";
import { type AxiosError } from "axios";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.post<AuthResponse>(
            "/api/auth/login",
            credentials
          );
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            user: {
              userId: data.userId,
              email: data.email,
              fullName: data.fullName,
              role: data.role,
            },
          });
        } catch (err) {
          const error = err as AxiosError<{ message: string }>;
          set({
            isLoading: false,
            error:
              error.response?.data?.message ??
              "Login failed. Please try again.",
          });
          throw err;
        }
      },

      register: async (payload: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.post<AuthResponse>(
            "/api/auth/register",
            payload
          );
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            user: {
              userId: data.userId,
              email: data.email,
              fullName: data.fullName,
              role: data.role,
            },
          });
        } catch (err) {
          const error = err as AxiosError<{ message: string }>;
          set({
            isLoading: false,
            error:
              error.response?.data?.message ??
              "Registration failed. Please try again.",
          });
          throw err;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state: AuthState) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);