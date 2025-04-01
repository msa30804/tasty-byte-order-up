
import React from "react";
import { usePos } from "@/contexts/PosContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClockIcon, CheckIcon, TableIcon } from "./PosIcons";
import { formatDistanceToNow } from "date-fns";

const OrdersView: React.FC = () => {
  const { orders, setActiveTable, tables } = usePos();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "preparing":
        return "bg-blue-500";
      case "ready":
        return "bg-green-500";
      case "served":
        return "bg-purple-500";
      case "paid":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };
  
  const formatOrderTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const getOrderTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleViewOrder = (tableNumber: number) => {
    const table = tables.find(t => t.number === tableNumber);
    if (table) {
      setActiveTable(table);
    }
  };
  
  const activeOrders = orders.filter(order => order.status !== "paid");
  const orderHistory = orders.filter(order => order.status === "paid");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <ClockIcon className="mr-2 h-5 w-5" />
          Active Orders ({activeOrders.length})
        </h2>
        
        {activeOrders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No active orders
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
              {activeOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <TableIcon className="mr-2 h-5 w-5" />
                          Table {order.tableNumber}
                        </CardTitle>
                        <CardDescription>Server: {order.serverName}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      {formatOrderTime(order.createdAt)}
                    </div>
                    
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantity}× {item.name}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      
                      {order.items.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          + {order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t flex justify-between font-medium">
                      <span>Total</span>
                      <span>${getOrderTotal(order.items)}</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      onClick={() => handleViewOrder(order.tableNumber)}
                      className="w-full bg-restaurant-burgundy hover:bg-restaurant-burgundy/90"
                    >
                      View Order
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <CheckIcon className="mr-2 h-5 w-5" />
          Order History ({orderHistory.length})
        </h2>
        
        {orderHistory.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No order history
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
              {orderHistory.map((order) => (
                <Card key={order.id} className="opacity-80">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>Table {order.tableNumber}</CardTitle>
                      <Badge variant="outline">Paid</Badge>
                    </div>
                    <CardDescription>{formatOrderTime(order.updatedAt)}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="font-medium mb-1">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} • ${getOrderTotal(order.items)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Server: {order.serverName}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default OrdersView;
