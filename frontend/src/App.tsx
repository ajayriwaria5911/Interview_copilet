// frontend/src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResumeDashboard from "./pages/ResumeDashboard";
import OAuth2CallbackPage from "./pages/OAuth2CallbackPage";
import InterviewPage from "./pages/InterviewPage";
import NewInterviewPage from "./pages/NewInterviewPage";
import ProtectedRoute from "./components/ProtectedRoute";

function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-400 mb-2">403</h1>
        <p className="text-slate-400">
          You don't have permission to access this page.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<ResumeDashboard />} />
          {/* ✅ /interview/new MUST be before /interview/:interviewId */}
          <Route path="/interview/new" element={<NewInterviewPage />} />
          <Route path="/interview/:interviewId" element={<InterviewPage />} />
        </Route>

        {/* Admin only */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route
            path="/admin"
            element={<div className="text-white p-8">Admin Panel</div>}
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}