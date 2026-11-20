"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyFieldErrors, getErrorMessage } from "@/lib/api/errors";
import { getAccessToken } from "@/lib/api/token-store";
import { useLoginMutation } from "../api/auth.queries";
import { createLoginSchema, LoginFormValues } from "../schemas/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  useEffect(() => {
    if (getAccessToken()) {
      router.replace("/");
    }
  }, [router]);

  const schema = useMemo(
    () =>
      createLoginSchema({
        invalidEmail: tAuth("validation.invalidEmail"),
        passwordRequired: tAuth("validation.passwordRequired"),
      }),
    [tAuth],
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLoginMutation();

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(values);
      toast.success(tAuth("welcomeBack"));
      router.replace("/");
    } catch (err) {
      applyFieldErrors(err, form.setError, ["email", "password"]);
      toast.error(getErrorMessage(err, tErrors));
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="mb-6 flex w-full max-w-md items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-navy-foreground">
            <Store className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-ink">
            {tCommon("appName")}
          </span>
        </div>
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-xl">{tAuth("title")}</CardTitle>
          <CardDescription>{tAuth("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="login-email">{tAuth("emailLabel")}</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder={tAuth("emailPlaceholder")}
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-password">{tAuth("passwordLabel")}</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder={tAuth("passwordPlaceholder")}
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{tAuth("submitting")}</span>
                </>
              ) : (
                tAuth("submit")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
