
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SettingsIcon, UsersIcon, RestaurantIcon, DatabaseIcon, LogOutIcon } from "../pos/PosIcons";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import UsersManagement from "./UsersManagement";
import ProductsManagement from "./ProductsManagement";

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminHeader />
      
      <div className="flex flex-1">
        <aside className="w-64 bg-gray-100 border-r p-4">
          <nav className="space-y-2">
            <Link to="/admin">
              <Button variant="ghost" className="w-full justify-start">
                <DatabaseIcon className="mr-2 h-5 w-5" />
                Dashboard
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="ghost" className="w-full justify-start">
                <UsersIcon className="mr-2 h-5 w-5" />
                Users
              </Button>
            </Link>
            <Link to="/admin/products">
              <Button variant="ghost" className="w-full justify-start">
                <RestaurantIcon className="mr-2 h-5 w-5" />
                Products
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start">
                <SettingsIcon className="mr-2 h-5 w-5" />
                POS System
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOutIcon className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </nav>
        </aside>
        
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/products" element={<ProductsManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/users">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md">
            <UsersIcon className="h-8 w-8 text-restaurant-burgundy mb-4" />
            <h2 className="font-bold text-lg">User Management</h2>
            <p className="text-gray-500">Manage cashiers and admin users</p>
          </div>
        </Link>
        <Link to="/admin/products">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md">
            <RestaurantIcon className="h-8 w-8 text-restaurant-burgundy mb-4" />
            <h2 className="font-bold text-lg">Product Management</h2>
            <p className="text-gray-500">Manage menu items and categories</p>
          </div>
        </Link>
        <Link to="/">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md">
            <SettingsIcon className="h-8 w-8 text-restaurant-burgundy mb-4" />
            <h2 className="font-bold text-lg">POS System</h2>
            <p className="text-gray-500">Go to the POS interface</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminLayout;
