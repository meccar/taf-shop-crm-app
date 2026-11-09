"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/stores/auth-context";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingLoader, VerifyingLoader } from "@/components/shared/loader";

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    login,
    isAuthenticated,
    isLoading: isAuthLoading,
    isLoggingIn,
  } = useAuth();

  const [showPassword, setShowPassword] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const redirectTarget = React.useMemo(() => {
    const raw = searchParams.get("redirect");
    if (!raw) return "/dashboard";
    try {
      const decoded = decodeURIComponent(raw);
      // Ensure redirect is a relative path to avoid open redirect vulnerabilities
      return decoded.startsWith("/") ? decoded : "/dashboard";
    } catch {
      return "/dashboard";
    }
  }, [searchParams]);

  // If already authenticated, redirect to destination
  React.useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [isAuthLoading, isAuthenticated, router, redirectTarget]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "sarah.j@shopcrm.internal",
      password: "password123",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null);
    try {
      await login(values);
      toast.success("Welcome back! Signed in successfully.");
      router.replace(redirectTarget);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Invalid email or password. Please verify your credentials.";
      setApiError(message);
    }
  };

  const fillDemoCredentials = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setApiError(null);
  };

  if (isAuthLoading || isLoggingIn) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
        <LoadingLoader />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col justify-center bg-slate-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy shadow-sm">
          <Store className="h-6 w-6 text-white" />
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to manage your business.
        </p>

        <div className="mt-2.5 flex items-center justify-center gap-2">
          <Badge
            variant="outline"
            className="border-slate-200 bg-white text-[11px] font-medium text-slate-700"
          >
            Tenant #RET-994
          </Badge>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">Cluster US-EAST</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6 pb-6">
            {apiError && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Authentication failed</p>
                  <p className="mt-0.5 text-destructive/90">{apiError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  Work Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@shopcrm.internal"
                    className="pl-9 text-sm"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field with Show/Hide */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-9 pr-10 text-sm"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white cursor-pointer"
              >
                {isSubmitting || isLoggingIn ? (
                  <VerifyingLoader />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo Credentials Helper */}
            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Demo Credentials
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Click to prefill
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fillDemoCredentials(
                      "sarah.j@shopcrm.internal",
                      "password123",
                    )
                  }
                  className="flex items-center justify-between rounded-lg border border-border bg-slate-50/80 px-3 py-2 text-left text-xs transition-colors hover:border-primary/40 hover:bg-accent/40 cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-slate-900">Sarah Jenkins</p>
                    <p className="text-[11px] text-muted-foreground">
                      sarah.j@shopcrm.internal (Operations Lead)
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    Valid Demo
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    fillDemoCredentials("invalid@test.com", "wrongpassword")
                  }
                  className="flex items-center justify-between rounded-lg border border-border bg-slate-50/80 px-3 py-2 text-left text-xs transition-colors hover:border-destructive/40 hover:bg-destructive/5 cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-slate-900">Test Invalid</p>
                    <p className="text-[11px] text-muted-foreground">
                      invalid@test.com (Simulates 401 Error)
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-destructive/30 text-[10px] text-destructive"
                  >
                    Error State
                  </Badge>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security / Architecture Footer Note */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Protected by HttpOnly refresh cookies & in-memory Bearer tokens.
        </p>
      </div>
    </div>
  );
}
