
import React from "react";
import { usePos } from "@/contexts/PosContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TrashIcon, MinusIcon, PlusIcon, ReceiptIcon } from "./PosIcons";
import { toast } from "@/components/ui/use-toast";

const CheckoutView: React.FC = () => {
  const { activeOrder, activeTable, updateOrderItemQuantity, removeFromOrder, payOrder } = usePos();
  const [checkoutDialogOpen, setCheckoutDialogOpen] = React.useState(false);
  
  if (!activeOrder || !activeTable) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <div className="text-restaurant-burgundy mb-6">
          <ReceiptIcon className="mx-auto h-16 w-16 opacity-80" />
        </div>
        <h2 className="text-xl font-bold mb-2">No Active Order</h2>
        <p className="text-muted-foreground mb-8">
          Select a table to create or view an order
        </p>
        <Button 
          variant="outline"
          className="text-restaurant-burgundy border-restaurant-burgundy"
          onClick={() => window.location.href = "#tables"}
        >
          Go to Tables
        </Button>
      </div>
    );
  }
  
  const subtotal = activeOrder.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const tax = subtotal * 0.0825; // 8.25% tax rate
  const total = subtotal + tax;
  
  const handleCheckout = () => {
    setCheckoutDialogOpen(false);
    payOrder();
    toast({
      title: "Payment Successful",
      description: `Order for Table ${activeTable.number} has been completed`,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        
        <ScrollArea className="h-[500px]">
          <CardContent>
            <div className="space-y-6 pr-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">Table {activeTable.number}</h3>
                  <p className="text-sm text-muted-foreground">Server: {activeOrder.serverName}</p>
                </div>
                <Badge>{activeOrder.status}</Badge>
              </div>
              
              <Separator />
              
              {activeOrder.items.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No items in order
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-grow">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateOrderItemQuantity(item.id, item.quantity - 1)}
                            >
                              <MinusIcon className="h-4 w-4" />
                            </Button>
                            
                            <span className="mx-3 min-w-[20px] text-center">{item.quantity}</span>
                            
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateOrderItemQuantity(item.id, item.quantity + 1)}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeFromOrder(item.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {item.notes && (
                          <div className="mt-1 text-sm text-muted-foreground italic">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (8.25%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-medium text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full h-12 text-lg bg-restaurant-orange hover:bg-restaurant-orange/90"
            disabled={activeOrder.items.length === 0}
            onClick={() => setCheckoutDialogOpen(true)}
          >
            <ReceiptIcon className="mr-2 h-5 w-5" /> Process Payment
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Process payment for Table {activeTable.number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold mb-1">${total.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                {activeOrder.items.length} item{activeOrder.items.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline">Cash</Button>
              <Button variant="outline">Credit Card</Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-restaurant-orange hover:bg-restaurant-orange/90"
              onClick={handleCheckout}
            >
              Complete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutView;
