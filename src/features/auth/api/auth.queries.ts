"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import type { LoginDto } from "@/features/auth/types/auth.type";

export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginDto) => authApi.login(credentials),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: authKeys.profile(),
      });
    },
  });
}

export function useRefresh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.refresh(),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: authKeys.profile(),
      });
    },
  });
}

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authApi.getProfile(),
    enabled,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),

    onSettled: () => {
      queryClient.removeQueries({
        queryKey: authKeys.all,
      });
    },
  });
}
