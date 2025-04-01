
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
};

export type OrderItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
};

export type Order = {
  id: string;
  tableNumber: number;
  serverName: string;
  items: OrderItem[];
  status: "pending" | "preparing" | "ready" | "served" | "paid";
  createdAt: Date;
  updatedAt: Date;
  discount?: {
    type: 'percentage' | 'amount';
    value: number;
  };
};

export type Table = {
  id: number;
  number: number;
  seats: number;
  status: "available" | "occupied" | "reserved";
  order?: Order;
};

type PosContextType = {
  menuItems: MenuItem[];
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  orders: Order[];
  tables: Table[];
  activeOrder: Order | null;
  activeTable: Table | null;
  setActiveTable: (table: Table | null) => void;
  createOrder: (tableNumber: number, serverName: string) => void;
  addToOrder: (menuItem: MenuItem, quantity?: number, notes?: string) => void;
  removeFromOrder: (orderItemId: string) => void;
  updateOrderItemQuantity: (orderItemId: string, quantity: number) => void;
  completeOrder: () => void;
  payOrder: () => void;
  applyDiscount: (type: 'percentage' | 'amount', value: number) => void;
};

// Demo data for tables
const demoTables: Table[] = [
  { id: 1, number: 1, seats: 2, status: "available" },
  { id: 2, number: 2, seats: 2, status: "available" },
  { id: 3, number: 3, seats: 4, status: "available" },
  { id: 4, number: 4, seats: 4, status: "available" },
  { id: 5, number: 5, seats: 6, status: "available" },
  { id: 6, number: 6, seats: 6, status: "available" },
  { id: 7, number: 7, seats: 8, status: "available" },
  { id: 8, number: 8, seats: 8, status: "available" },
  { id: 9, number: 9, seats: 2, status: "available" },
  { id: 10, number: 10, seats: 4, status: "available" },
];

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || "All");
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>(demoTables);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  
  // Fetch initial menu items from Supabase
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        setMenuItems(data || []);
        const uniqueCategories = [...new Set((data || []).map(item => item.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };
    
    fetchMenuItems();
  }, []);
  
  const createOrder = (tableNumber: number, serverName: string = user?.name || "Server") => {
    const tableIndex = tables.findIndex(t => t.number === tableNumber);
    if (tableIndex === -1) return;
    
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      tableNumber,
      serverName,
      items: [],
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setOrders(prev => [...prev, newOrder]);
    
    const updatedTables = [...tables];
    updatedTables[tableIndex] = {
      ...updatedTables[tableIndex],
      status: "occupied",
      order: newOrder,
    };
    
    setTables(updatedTables);
    setActiveOrder(newOrder);
    setActiveTable(updatedTables[tableIndex]);
    
    toast({
      title: "Order Created",
      description: `New order for Table ${tableNumber}`,
    });
  };
  
  const addToOrder = (menuItem: MenuItem, quantity: number = 1, notes: string = "") => {
    if (!activeOrder) return;
    
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      notes,
    };
    
    const updatedOrder = {
      ...activeOrder,
      items: [...activeOrder.items, newItem],
      updatedAt: new Date(),
    };
    
    setOrders(prev => prev.map(o => o.id === activeOrder.id ? updatedOrder : o));
    setActiveOrder(updatedOrder);
    
    if (activeTable) {
      const updatedTables = tables.map(t => 
        t.id === activeTable.id 
          ? { ...t, order: updatedOrder }
          : t
      );
      setTables(updatedTables);
    }
    
    toast({
      title: `Added to Order`,
      description: `${quantity}× ${menuItem.name} added to Table ${activeOrder.tableNumber}`,
    });
  };
  
  const removeFromOrder = (orderItemId: string) => {
    if (!activeOrder) return;
    
    const updatedItems = activeOrder.items.filter(item => item.id !== orderItemId);
    const updatedOrder = {
      ...activeOrder,
      items: updatedItems,
      updatedAt: new Date(),
    };
    
    setOrders(prev => prev.map(o => o.id === activeOrder.id ? updatedOrder : o));
    setActiveOrder(updatedOrder);
    
    if (activeTable) {
      const updatedTables = tables.map(t => 
        t.id === activeTable.id 
          ? { ...t, order: updatedOrder }
          : t
      );
      setTables(updatedTables);
    }
    
    toast({
      title: "Item Removed",
      description: "Item removed from order",
    });
  };
  
  const updateOrderItemQuantity = (orderItemId: string, quantity: number) => {
    if (!activeOrder) return;
    if (quantity <= 0) {
      removeFromOrder(orderItemId);
      return;
    }
    
    const updatedItems = activeOrder.items.map(item => 
      item.id === orderItemId 
        ? { ...item, quantity }
        : item
    );
    
    const updatedOrder = {
      ...activeOrder,
      items: updatedItems,
      updatedAt: new Date(),
    };
    
    setOrders(prev => prev.map(o => o.id === activeOrder.id ? updatedOrder : o));
    setActiveOrder(updatedOrder);
    
    if (activeTable) {
      const updatedTables = tables.map(t => 
        t.id === activeTable.id 
          ? { ...t, order: updatedOrder }
          : t
      );
      setTables(updatedTables);
    }
  };
  
  const completeOrder = () => {
    if (!activeOrder) return;
    
    const updatedOrder = {
      ...activeOrder,
      status: "served" as const,
      updatedAt: new Date(),
    };
    
    setOrders(prev => prev.map(o => o.id === activeOrder.id ? updatedOrder : o));
    setActiveOrder(updatedOrder);
    
    if (activeTable) {
      const updatedTables = tables.map(t => 
        t.id === activeTable.id 
          ? { ...t, order: updatedOrder }
          : t
      );
      setTables(updatedTables);
    }
    
    toast({
      title: "Order Served",
      description: `Order for Table ${activeOrder.tableNumber} is now served`,
    });
  };
  
  const payOrder = () => {
    if (!activeOrder || !activeTable) return;
    
    const updatedOrder = {
      ...activeOrder,
      status: "paid" as const,
      updatedAt: new Date(),
    };
    
    // Save order to database (if needed)
    const saveOrderToDatabase = async () => {
      try {
        await supabase
          .from('orders')
          .insert([{
            id: updatedOrder.id,
            table_number: updatedOrder.tableNumber,
            server_name: updatedOrder.serverName,
            items: JSON.stringify(updatedOrder.items),
            status: updatedOrder.status,
            created_at: updatedOrder.createdAt.toISOString(),
            updated_at: updatedOrder.updatedAt.toISOString(),
            discount: updatedOrder.discount ? JSON.stringify(updatedOrder.discount) : null,
            total_amount: calculateTotal(updatedOrder),
          }]);
      } catch (error) {
        console.error('Error saving order:', error);
      }
    };
    
    saveOrderToDatabase();
    
    setOrders(prev => prev.map(o => o.id === activeOrder.id ? updatedOrder : o));
    
    const updatedTables = tables.map(t => 
      t.id === activeTable.id 
        ? { ...t, status: "available" as const, order: undefined }
        : t
    );
    
    setTables(updatedTables);
    setActiveOrder(null);
    setActiveTable(null);
    
    toast({
      title: "Payment Complete",
      description: `Order for Table ${activeOrder.tableNumber} has been paid`,
    });
  };
  
  const applyDiscount = (type: 'percentage' | 'amount', value: number) => {
    if (!activeOrder) return;
    
    const updatedOrder = {
      ...activeOrder,
      discount: { type, value },
      updatedAt: new Date(),
    };
    
    setOrders(prev => prev.map(o => o.id === activeOrder.id ? updatedOrder : o));
    setActiveOrder(updatedOrder);
    
    if (activeTable) {
      const updatedTables = tables.map(t => 
        t.id === activeTable.id 
          ? { ...t, order: updatedOrder }
          : t
      );
      setTables(updatedTables);
    }
  };
  
  const calculateTotal = (order: Order) => {
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let discount = 0;
    if (order.discount) {
      discount = order.discount.type === 'percentage' 
        ? subtotal * (order.discount.value / 100)
        : Math.min(order.discount.value, subtotal);
    }
    
    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * 0.0825;
    return discountedSubtotal + tax;
  };
  
  const value = {
    menuItems,
    categories,
    activeCategory,
    setActiveCategory,
    orders,
    tables,
    activeOrder,
    activeTable,
    setActiveTable,
    createOrder,
    addToOrder,
    removeFromOrder,
    updateOrderItemQuantity,
    completeOrder,
    payOrder,
    applyDiscount,
  };
  
  return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
};

export const usePos = (): PosContextType => {
  const context = useContext(PosContext);
  if (context === undefined) {
    throw new Error("usePos must be used within a PosProvider");
  }
  return context;
};
