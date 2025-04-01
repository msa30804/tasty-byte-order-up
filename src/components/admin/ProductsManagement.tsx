
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { RestaurantIcon, PlusIcon, EditIcon, TrashIcon } from '../pos/PosIcons';
import { useToast } from '@/components/ui/use-toast';
import { MenuItem } from '@/contexts/PosContext';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon } from '../pos/PosIcons';

interface ProductFormData {
  id?: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image?: string | File;
}

const categories = ["Starters", "Main Course", "Desserts", "Drinks", "Sides"];

const ProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    category: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `menu-items/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);
      
    if (error) throw error;
    
    const { data: publicUrl } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);
      
    return publicUrl.publicUrl;
  };
  
  const handleAddOrUpdateProduct = async () => {
    try {
      setIsSubmitting(true);
      
      const { name, price, category, description } = formData;
      
      if (!name || !category || price <= 0) {
        toast({
          title: 'Error',
          description: 'Name, category and price are required',
          variant: 'destructive',
        });
        return;
      }
      
      let imageUrl = formData.image as string;
      
      // If there's a new image file, upload it
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      const productData = {
        name,
        price,
        category,
        description,
        image: imageUrl,
      };
      
      if (isEditing && formData.id) {
        // Update existing product
        const { error } = await supabase
          .from('menu_items')
          .update(productData)
          .eq('id', formData.id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: `${name} updated successfully`,
        });
      } else {
        // Add new product
        const { error } = await supabase
          .from('menu_items')
          .insert([productData]);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: `${name} added successfully`,
        });
      }
      
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = (product: MenuItem) => {
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      image: product.image,
    });
    setImagePreview(product.image || null);
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      category: '',
      description: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(false);
  };
  
  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button onClick={openAddDialog} className="bg-restaurant-burgundy hover:bg-restaurant-burgundy/90">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RestaurantIcon className="mr-2 h-5 w-5" /> 
            Menu Items
          </CardTitle>
          <CardDescription>
            Manage your restaurant menu items
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading products...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const CategoryIcon = getCategoryIcon(product.category);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                            <img 
                              src={product.image || "/placeholder.svg"} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className="flex items-center gap-1">
                            <CategoryIcon className="h-3 w-3" />
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(product.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Classic Burger"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="e.g. 12.99"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the product..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview"
                    className="w-full max-h-40 object-cover rounded-md" 
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddOrUpdateProduct} 
              className="bg-restaurant-burgundy hover:bg-restaurant-burgundy/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsManagement;
