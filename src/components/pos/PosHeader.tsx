
import React from "react";
import { Clock } from "lucide-react";
import { usePos } from "@/contexts/PosContext";

const PosHeader: React.FC = () => {
  const { activeTable, activeOrder } = usePos();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <header className="bg-restaurant-burgundy text-white p-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-bold">Tasty Byte POS</h1>
          {activeTable && (
            <span className="ml-4 bg-restaurant-orange py-1 px-3 rounded-full text-sm">
              Table {activeTable.number}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {activeOrder && (
            <div className="hidden md:block text-right">
              <p className="text-sm text-gray-200">Active Order</p>
              <p className="font-medium">
                {activeOrder.items.length} items • ${activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
              </p>
            </div>
          )}
          
          <div className="flex flex-col items-end">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{formatTime(currentTime)}</span>
            </div>
            <span className="text-xs text-gray-200">{formatDate(currentTime)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PosHeader;
