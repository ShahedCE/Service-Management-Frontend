"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Network, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { api } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

// Validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      if (response.data?.success) {
        const { accessToken: token, user } = response.data.data;
        // Save to Zustand & Cookies
        login(token, user, data.remember || false);

        // Let middleware handle the redirect based on role, or we can push manually
        if (user.role === "SUPERVISOR") {
          router.push("/supervisor/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error", error);
      const err = error as { response?: { data?: { message?: string } } };
      setErrorMsg(
        err.response?.data?.message || "Invalid credentials or server error."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Subtle dotted background pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />

      {/* Ambient background glow (optional subtle touch) */}
      <div className="absolute inset-0 z-0 flex justify-center items-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] dark:bg-primary/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full max-w-[420px] px-6"
      >
        <Card className="border-border/50 shadow-xl shadow-primary/5 dark:shadow-none dark:border-border/30 rounded-3xl overflow-hidden backdrop-blur-sm bg-card/95">
          <CardContent className="p-12 pt-10 pb-8">

            {/* Header / Logo */}
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                  <Network size={20} strokeWidth={2.5} />
                </div>
                <span className="text-xl font-semibold text-primary tracking-tight">Easy Service</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Sign In</h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access the console.
              </p>

              {/* System Online Pill */}
              <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                SYSTEM ONLINE
              </div>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-center font-medium">
                    {errorMsg}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Work Email</Label>
                      <FormControl>
                        <Input
                          placeholder="name@company.com"
                          {...field}
                          className="h-11 bg-secondary/50 border-border/50 focus-visible:bg-background"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Password</Label>
                        {/* Hidden as per user requirement 'no forgot', but kept space just in case */}
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="h-11 bg-secondary/50 border-border/50 focus-visible:bg-background pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-2 pb-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-muted-foreground/30 data-[state=checked]:border-primary"
                        />
                      </FormControl>
                      <Label className="text-sm font-normal text-muted-foreground cursor-pointer">
                        Remember this device
                      </Label>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  {isLoading ? "Signing in..." : (
                    <>
                      Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Footer Links */}
            <div className="mt-6 flex justify-center gap-3 text-xs font-medium text-muted-foreground">
              <span className="cursor-pointer hover:text-foreground transition-colors">Security Policy</span>
              <span className="cursor-pointer hover:text-foreground transition-colors">Help Center</span>

            </div>

          </CardContent>
        </Card>

      </motion.div>
    </div>

  );
}
