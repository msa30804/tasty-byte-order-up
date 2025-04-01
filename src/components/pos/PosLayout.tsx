
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PosProvider } from "@/contexts/PosContext";
import MenuView from "./MenuView";
import TablesView from "./TablesView";
import OrdersView from "./OrdersView";
import CheckoutView from "./CheckoutView";
import { RestaurantIcon, TableIcon, ClipboardListIcon, CreditCardIcon } from "./PosIcons";
import PosHeader from "./PosHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const PosLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <PosProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <PosHeader />
        <main className="flex-grow p-4 md:p-6 lg:p-8">
          <Tabs defaultValue="tables" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="tables" className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Tables</span>
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center gap-2">
                <RestaurantIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Menu</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ClipboardListIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="checkout" className="flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Checkout</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tables" className="space-y-4">
              <TablesView />
            </TabsContent>
            
            <TabsContent value="menu" className="space-y-4">
              <MenuView />
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              <OrdersView />
            </TabsContent>
            
            <TabsContent value="checkout" className="space-y-4">
              <CheckoutView />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PosProvider>
  );
};

export default PosLayout;
