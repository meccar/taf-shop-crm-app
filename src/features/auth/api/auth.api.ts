import { apiRequest } from "@/lib/api/client";
import {
  LoginDto,
  AuthTokensResponse,
  LogoutResponse,
  AuthUser,
} from "../types/auth.type";
import { ApiResponse } from "@/types/common.type";

export const authApi = {
  login: async (
    credentials: LoginDto,
  ): Promise<ApiResponse<AuthTokensResponse>> => {
    return apiRequest<ApiResponse<AuthTokensResponse>, LoginDto>(
      "/auth/login",
      {
        method: "POST",
        body: credentials,
        skipAuth: true,
      },
    );
  },

  refresh: async (): Promise<ApiResponse<AuthTokensResponse>> => {
    return apiRequest<ApiResponse<AuthTokensResponse>>("/auth/refresh", {
      method: "POST",
      skipAuth: true,
    });
  },

  logout: async (): Promise<ApiResponse<LogoutResponse>> => {
    return apiRequest<ApiResponse<LogoutResponse>>("/auth/logout", {
      method: "POST",
      skipAuth: true,
    });
  },

  getProfile: async (): Promise<ApiResponse<AuthUser>> => {
    return apiRequest<ApiResponse<AuthUser>>("/profile", {
      method: "GET",
    });
  },
};
