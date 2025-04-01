
import React, { useState, useEffect } from "react";
import { usePos, MenuItem } from "@/contexts/PosContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategoryIcon } from "./PosIcons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

const MenuView: React.FC = () => {
  const { addToOrder, activeOrder, activeTable } = usePos();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as MenuItem[];
    }
  });
  
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
      setCategories(uniqueCategories);
      
      if (activeCategory === "" && uniqueCategories.length > 0) {
        setActiveCategory("All");
      }
    }
  }, [menuItems]);
  
  const filteredItems = menuItems
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(item => activeCategory === "All" || item.category === activeCategory);

  const handleAddToOrder = () => {
    if (!selectedItem) return;
    
    if (!activeOrder || !activeTable) {
      toast({
        title: "No Active Order",
        description: "Please select a table first to create an order",
        variant: "destructive",
      });
      setSelectedItem(null);
      return;
    }
    
    addToOrder(selectedItem, quantity, notes);
    setSelectedItem(null);
    setQuantity(1);
    setNotes("");
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-4 w-full overflow-x-auto flex flex-nowrap justify-start pos-scrollbar">
            <TabsTrigger value="All" className="flex-shrink-0">All</TabsTrigger>
            {categories.map((category) => {
              const CategoryIcon = getCategoryIcon(category);
              return (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="flex-shrink-0 flex items-center gap-1"
                >
                  <CategoryIcon className="h-4 w-4" />
                  {category}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading menu items...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No items found</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-restaurant-orange"
                onClick={() => setSelectedItem(item)}
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img 
                    src={item.image || "/placeholder.svg"} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-restaurant-burgundy">
                    ${item.price.toFixed(2)}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
      
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        {selectedItem && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedItem.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img 
                  src={selectedItem.image || "/placeholder.svg"} 
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <Badge className="mb-2">{selectedItem.category}</Badge>
                <p className="text-lg font-bold">${selectedItem.price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedItem.description}</p>
              </div>
              
              <div className="flex items-center justify-between border rounded-md p-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <X className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <Textarea 
                placeholder="Special instructions or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>Cancel</Button>
              <Button 
                className="bg-restaurant-orange hover:bg-restaurant-orange/90" 
                onClick={handleAddToOrder}
              >
                Add to Order (${(selectedItem.price * quantity).toFixed(2)})
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default MenuView;
