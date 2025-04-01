
import React, { useState } from "react";
import { usePos } from "@/contexts/PosContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserIcon } from "./PosIcons";
import { toast } from "@/components/ui/use-toast";

const TablesView: React.FC = () => {
  const { tables, createOrder, setActiveTable } = usePos();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [serverName, setServerName] = useState("Server");

  const handleNewOrder = () => {
    if (!selectedTable) return;
    
    createOrder(selectedTable, serverName);
    setSelectedTable(null);
    setServerName("Server");
    
    toast({
      title: "New Order Created",
      description: `Order started for Table ${selectedTable}`,
    });
  };

  const handleTableClick = (tableNumber: number, tableStatus: string) => {
    if (tableStatus === "available") {
      setSelectedTable(tableNumber);
    } else {
      // If table is occupied, set as active table
      const table = tables.find(t => t.number === tableNumber);
      if (table) {
        setActiveTable(table);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => {
          const isOccupied = table.status === "occupied";
          return (
            <Card 
              key={table.id}
              className={`cursor-pointer transition-all transform hover:scale-105 ${
                isOccupied ? "border-restaurant-burgundy bg-restaurant-burgundy/10" : "border-gray-200"
              }`}
              onClick={() => handleTableClick(table.number, table.status)}
            >
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Table {table.number}</span>
                  {isOccupied && (
                    <span className="inline-block w-3 h-3 bg-restaurant-orange rounded-full"></span>
                  )}
                </CardTitle>
                <CardDescription>{table.seats} seats</CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 pt-0">
                <div className="h-16 flex items-center justify-center">
                  {isOccupied ? (
                    table.order ? (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">
                          {table.order.items.length} item{table.order.items.length !== 1 ? 's' : ''}
                        </p>
                        <p className="font-medium">
                          ${table.order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Occupied</p>
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">Available</p>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 flex justify-center">
                <Button 
                  variant={isOccupied ? "outline" : "default"} 
                  size="sm" 
                  className={isOccupied ? "" : "bg-restaurant-orange hover:bg-restaurant-orange/90"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isOccupied) {
                      setSelectedTable(table.number);
                    } else if (table.order) {
                      setActiveTable(table);
                    }
                  }}
                >
                  {isOccupied ? "View Order" : "New Order"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      <Dialog open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
        {selectedTable && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Order for Table {selectedTable}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="server-name">Server Name</Label>
                <div className="flex">
                  <div className="bg-muted p-2 rounded-l-md border border-r-0">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <Input 
                    id="server-name"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTable(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleNewOrder}
                className="bg-restaurant-orange hover:bg-restaurant-orange/90"
              >
                Create Order
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default TablesView;
