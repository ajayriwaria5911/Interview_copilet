// frontend/src/pages/RegisterPage.tsx

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, User, BrainCircuit, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, isAuthenticated, clearError } =
    useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
    return () => clearError();
  }, [isAuthenticated, navigate, clearError]);

  const onSubmit = async ({ fullName, email, password }: RegisterFormData) => {
    try {
      await registerUser({ fullName, email, password });
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
            Create your free account
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-600 rounded-2xl px-8 py-10 shadow-2xl">

          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2.5">
                Full Name
              </label>
              <div className="flex items-center bg-slate-900 border border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
                {/* ✅ CHANGED: px-4 → px-5 */}
                <div className="px-5 py-4 flex items-center shrink-0 border-r border-slate-600">
                  <User className="w-5 h-5 text-indigo-400" />
                </div>
                {/* ✅ CHANGED: px-4 → px-5 */}
                <input
                  {...register("fullName")}
                  type="text"
                  placeholder="John Doe"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 py-4 px-5 text-sm focus:outline-none"
                />
              </div>
              {errors.fullName && (
                <p className="mt-2 text-xs text-red-400">• {errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2.5">
                Email Address
              </label>
              <div className="flex items-center bg-slate-900 border border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
                {/* ✅ CHANGED: px-4 → px-5 */}
                <div className="px-5 py-4 flex items-center shrink-0 border-r border-slate-600">
                  <Mail className="w-5 h-5 text-indigo-400" />
                </div>
                {/* ✅ CHANGED: px-4 → px-5 */}
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
                {/* ✅ CHANGED: px-4 → px-5 */}
                <div className="px-5 py-4 flex items-center shrink-0 border-r border-slate-600">
                  <Lock className="w-5 h-5 text-indigo-400" />
                </div>
                {/* ✅ CHANGED: px-4 → px-5 */}
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2.5">
                Confirm Password
              </label>
              <div className="flex items-center bg-slate-900 border border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
                {/* ✅ CHANGED: px-4 → px-5 */}
                <div className="px-5 py-4 flex items-center shrink-0 border-r border-slate-600">
                  <Lock className="w-5 h-5 text-indigo-400" />
                </div>
                {/* ✅ CHANGED: px-4 → px-5 */}
                <input
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 py-4 px-5 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="px-5 py-4 flex items-center text-slate-400 hover:text-indigo-400 transition-colors shrink-0 border-l border-slate-600"
                >
                  {showConfirm
                    ? <EyeOff className="w-5 h-5" />
                    : <Eye className="w-5 h-5" />
                  }
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-red-400">• {errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base shadow-lg shadow-indigo-500/30 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-600" />
            <span className="text-slate-500 text-xs font-medium px-2">OR</span>
            <div className="flex-1 h-px bg-slate-600" />
          </div>

          <p className="text-center text-slate-400 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Sign in →
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