
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PosLayout from "./components/pos/PosLayout";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AdminLayout from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute: React.FC<{
  element: React.ReactElement;
  requiredRole?: 'admin' | 'cashier' | undefined;
}> = ({ element, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole && !(requiredRole === 'cashier' && user?.role === 'admin')) {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={<ProtectedRoute element={<PosLayout />} requiredRole="cashier" />} 
      />
      <Route 
        path="/admin/*" 
        element={<ProtectedRoute element={<AdminLayout />} requiredRole="admin" />} 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
