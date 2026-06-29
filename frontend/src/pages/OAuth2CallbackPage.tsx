// frontend/src/pages/OAuth2CallbackPage.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function OAuth2CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const userId = params.get("userId");
    const email = params.get("email");
    const fullName = params.get("fullName");
    const role = params.get("role");

    if (accessToken && email) {
      useAuthStore.setState({
        accessToken,
        refreshToken,
        isAuthenticated: true,
        user: {
          userId: Number(userId),
          email: email!,
          fullName: fullName!,
          role: role!,
        },
      });
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Signing you in with Google...</p>
      </div>
    </div>
  );
}