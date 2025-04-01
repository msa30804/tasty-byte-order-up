
import React, { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "@/components/ui/use-toast";

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
};

const defaultServerName = "Server";

// Demo data
const demoMenuItems: MenuItem[] = [
  { id: "1", name: "Classic Burger", price: 12.99, category: "Main Course", image: "/placeholder.svg", description: "Juicy beef patty with lettuce, tomato, and our special sauce" },
  { id: "2", name: "Caesar Salad", price: 9.99, category: "Starters", image: "/placeholder.svg", description: "Crisp romaine lettuce with creamy Caesar dressing, croutons, and parmesan" },
  { id: "3", name: "Margherita Pizza", price: 14.99, category: "Main Course", image: "/placeholder.svg", description: "Fresh mozzarella, tomato sauce, and basil on a thin crust" },
  { id: "4", name: "French Fries", price: 4.99, category: "Sides", image: "/placeholder.svg", description: "Crispy golden fries served with ketchup" },
  { id: "5", name: "Chocolate Lava Cake", price: 7.99, category: "Desserts", image: "/placeholder.svg", description: "Warm chocolate cake with a molten center, served with vanilla ice cream" },
  { id: "6", name: "Iced Tea", price: 2.99, category: "Drinks", image: "/placeholder.svg", description: "Refreshing iced tea with lemon" },
  { id: "7", name: "Craft Beer", price: 6.99, category: "Drinks", image: "/placeholder.svg", description: "Local craft beer on tap" },
  { id: "8", name: "Chicken Wings", price: 11.99, category: "Starters", image: "/placeholder.svg", description: "Crispy wings tossed in your choice of sauce" },
  { id: "9", name: "Fish & Chips", price: 15.99, category: "Main Course", image: "/placeholder.svg", description: "Beer-battered fish with thick-cut fries and tartar sauce" },
  { id: "10", name: "Onion Rings", price: 5.99, category: "Sides", image: "/placeholder.svg", description: "Crispy battered onion rings" },
  { id: "11", name: "Cheesecake", price: 6.99, category: "Desserts", image: "/placeholder.svg", description: "New York style cheesecake with berry compote" },
  { id: "12", name: "Espresso", price: 3.49, category: "Drinks", image: "/placeholder.svg", description: "Double shot of our premium espresso blend" },
];

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
  const [menuItems] = useState<MenuItem[]>(demoMenuItems);
  const [categories] = useState<string[]>([...new Set(demoMenuItems.map(item => item.category))]);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || "All");
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>(demoTables);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [activeTable, setActiveTable] = useState<Table | null>(null);

  const createOrder = (tableNumber: number, serverName: string = defaultServerName) => {
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
