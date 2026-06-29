// frontend/src/pages/LoginPage.tsx

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, BrainCircuit, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import GoogleLoginButton from "../components/GoogleLoginButton";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
    return () => clearError();
  }, [isAuthenticated, navigate, clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      navigate("/dashboard");
    } catch {
      // error already set in store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center px-6 py-12">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl mb-4 shadow-2xl shadow-indigo-500/40">
            <BrainCircuit className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight text-center">
            InterviewCopilot AI
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Welcome back! Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-600 rounded-2xl px-8 py-10 shadow-2xl">

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2.5">
                Email Address
              </label>
              <div className="flex items-center bg-slate-900 border border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
                <div className="px-5 py-4 flex items-center shrink-0 border-r border-slate-600">
                  <Mail className="w-5 h-5 text-indigo-400" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 py-4 px-5 text-sm focus:outline-none"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-xs text-red-400">• {errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2.5">
                Password
              </label>
              <div className="flex items-center bg-slate-900 border border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
                <div className="px-5 py-4 flex items-center shrink-0 border-r border-slate-600">
                  <Lock className="w-5 h-5 text-indigo-400" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 py-4 px-5 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-5 py-4 flex items-center text-slate-400 hover:text-indigo-400 transition-colors shrink-0 border-l border-slate-600"
                >
                  {showPassword
                    ? <EyeOff className="w-5 h-5" />
                    : <Eye className="w-5 h-5" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-red-400">• {errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In →"
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-600" />
            <span className="text-slate-500 text-xs font-medium px-2">OR</span>
            <div className="flex-1 h-px bg-slate-600" />
          </div>

          {/* Google Login */}
          <GoogleLoginButton />

          {/* Sign up link */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Create one free →
            </Link>
          </p>

        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-5">
          Protected by enterprise-grade security 🔒
        </p>

      </div>
    </div>
  );
}