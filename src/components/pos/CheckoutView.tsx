
import React, { useState } from "react";
import { usePos } from "@/contexts/PosContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { TrashIcon, MinusIcon, PlusIcon, ReceiptIcon, PrinterIcon, EditIcon, PercentIcon } from "./PosIcons";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const CheckoutView: React.FC = () => {
  const { activeOrder, activeTable, updateOrderItemQuantity, removeFromOrder, payOrder } = usePos();
  const { user } = useAuth();
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  
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
  
  const discount = discountType === 'percentage' 
    ? subtotal * (discountValue / 100)
    : Math.min(discountValue, subtotal);
    
  const discountedSubtotal = subtotal - discount;
  
  const tax = discountedSubtotal * 0.0825; // 8.25% tax rate
  const total = discountedSubtotal + tax;
  
  const handleCheckout = () => {
    setCheckoutDialogOpen(false);
    payOrder();
    toast({
      title: "Payment Successful",
      description: `Order for Table ${activeTable.number} has been completed`,
    });
  };
  
  const handleApplyDiscount = () => {
    setDiscountDialogOpen(false);
    toast({
      title: "Discount Applied",
      description: `${discountType === 'percentage' ? `${discountValue}%` : `$${discountValue.toFixed(2)}`} discount applied to order`,
    });
  };
  
  const handlePrint = () => {
    const receipt = generateReceipt();
    
    // Open print dialog with formatted receipt
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - Table ${activeTable.number}</title>
            <style>
              body {
                font-family: monospace;
                padding: 20px;
                max-width: 400px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
              }
              .total {
                margin-top: 10px;
                border-top: 1px dashed #000;
                padding-top: 10px;
                font-weight: bold;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 14px;
              }
              @media print {
                button {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Tasty Byte Restaurant</h2>
              <p>123 Food St, Foodville</p>
              <p>Phone: (123) 456-7890</p>
              <p>Date: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
              <h3>Table ${activeTable.number} - Receipt</h3>
              <p>Server: ${activeOrder.serverName}</p>
            </div>
            
            <div class="items">
              ${receipt.items}
            </div>
            
            <div class="item">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            
            ${discount > 0 ? `
              <div class="item">
                <span>Discount:</span>
                <span>-$${discount.toFixed(2)}</span>
              </div>
            ` : ''}
            
            <div class="item">
              <span>Tax (8.25%):</span>
              <span>$${tax.toFixed(2)}</span>
            </div>
            
            <div class="total">
              <span>Total:</span>
              <span>$${total.toFixed(2)}</span>
            </div>
            
            <div class="footer">
              <p>Thank you for dining with us!</p>
              <p>Please come again</p>
            </div>
            
            <button onclick="window.print(); window.close();">Print Receipt</button>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    }
    
    setPrintDialogOpen(false);
  };
  
  const generateReceipt = () => {
    let itemsHtml = '';
    
    activeOrder.items.forEach(item => {
      itemsHtml += `
        <div class="item">
          <span>${item.quantity}x ${item.name}</span>
          <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `;
    });
    
    return {
      items: itemsHtml
    };
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
            
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount {discountType === 'percentage' ? `(${discountValue}%)` : ''}</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            
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
          
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={() => setDiscountDialogOpen(true)}
              disabled={activeOrder.items.length === 0}
            >
              <PercentIcon className="mr-2 h-5 w-5" /> Add Discount
            </Button>
            
            <Button 
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={() => setPrintDialogOpen(true)}
              disabled={activeOrder.items.length === 0}
            >
              <PrinterIcon className="mr-2 h-5 w-5" /> Print Bill
            </Button>
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
      
      {/* Checkout Dialog */}
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
      
      {/* Discount Dialog */}
      <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Discount</DialogTitle>
            <DialogDescription>
              Apply a discount to the current order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Button 
                variant={discountType === 'percentage' ? 'default' : 'outline'}
                onClick={() => setDiscountType('percentage')}
                className={discountType === 'percentage' ? 'bg-restaurant-burgundy hover:bg-restaurant-burgundy/90' : ''}
              >
                Percentage (%)
              </Button>
              <Button 
                variant={discountType === 'amount' ? 'default' : 'outline'}
                onClick={() => setDiscountType('amount')}
                className={discountType === 'amount' ? 'bg-restaurant-burgundy hover:bg-restaurant-burgundy/90' : ''}
              >
                Fixed Amount ($)
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
              </Label>
              <Input
                id="discountValue"
                type="number"
                min="0"
                max={discountType === 'percentage' ? '100' : undefined}
                step={discountType === 'percentage' ? '1' : '0.01'}
                value={discountValue || ''}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
              />
              
              {discountType === 'percentage' ? (
                <p className="text-sm text-muted-foreground">
                  ${(subtotal * (discountValue / 100)).toFixed(2)} off total
                </p>
              ) : null}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscountDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-restaurant-burgundy hover:bg-restaurant-burgundy/90"
              onClick={handleApplyDiscount}
            >
              Apply Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Print Dialog */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Print Bill</DialogTitle>
            <DialogDescription>
              Print receipt for Table {activeTable.number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 border rounded-md p-4 bg-gray-50 font-mono text-sm">
            <div className="text-center">
              <p className="font-bold">Tasty Byte Restaurant</p>
              <p>Table {activeTable.number} - Receipt Preview</p>
              <p>Server: {activeOrder.serverName}</p>
              <p>{format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            
            <Separator />
            
            {activeOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.quantity}× {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Tax (8.25%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-restaurant-burgundy hover:bg-restaurant-burgundy/90"
              onClick={handlePrint}
            >
              <PrinterIcon className="mr-2 h-4 w-4" /> Print Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutView;
