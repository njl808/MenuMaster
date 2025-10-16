import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation as useWouterLocation } from "wouter";
import type { Restaurant, Category, MenuItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

import burgerImg from "@assets/generated_images/Gourmet_burger_food_photo_be0260fb.png";
import saladImg from "@assets/generated_images/Caesar_salad_food_photo_f979d014.png";
import pizzaImg from "@assets/generated_images/Margherita_pizza_food_photo_9c7d96a3.png";
import salmonImg from "@assets/generated_images/Grilled_salmon_food_photo_b962d180.png";

const placeholderImages = [burgerImg, saladImg, pizzaImg, salmonImg];

interface CartItem {
  item: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export default function CustomerMenu() {
  const [, params] = useRoute("/menu/:restaurantId");
  const restaurantId = params?.restaurantId;
  const [, navigate] = useWouterLocation();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories", restaurantId],
    enabled: !!restaurantId,
  });

  const { data: allItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items/all", restaurantId],
    enabled: !!restaurantId,
  });

  const addToCart = (item: MenuItem) => {
    const existingIndex = cart.findIndex((c) => c.item.id === item.id);
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    toast({ title: `${item.name} added to cart` });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const newCart = cart.map((c) =>
      c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c
    ).filter((c) => c.quantity > 0);
    setCart(newCart);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.item.id !== itemId));
  };

  const cartTotal = cart.reduce((sum, c) => sum + parseFloat(c.item.price) * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const filteredItems = selectedCategory
    ? allItems?.filter((item) => item.categoryId === selectedCategory)
    : allItems;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Store cart in sessionStorage for checkout page
    sessionStorage.setItem("checkout-cart", JSON.stringify({ restaurantId, cart }));
    navigate(`/checkout/${restaurantId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-restaurant-name">{restaurant?.name || "Menu"}</h1>
              {restaurant?.description && (
                <p className="text-sm text-muted-foreground mt-1">{restaurant.description}</p>
              )}
            </div>
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative" data-testid="button-cart">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                  <SheetDescription>
                    {cartCount} {cartCount === 1 ? "item" : "items"} in cart
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {cart.map((cartItem) => (
                          <Card key={cartItem.item.id}>
                            <CardContent className="p-3">
                              <div className="flex gap-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{cartItem.item.name}</h4>
                                  <p className="text-sm text-primary font-semibold mt-1">
                                    ${(parseFloat(cartItem.item.price) * cartItem.quantity).toFixed(2)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(cartItem.item.id, -1)}
                                    data-testid={`button-decrease-${cartItem.item.id}`}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">{cartItem.quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(cartItem.item.id, 1)}
                                    data-testid={`button-increase-${cartItem.item.id}`}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => removeFromCart(cartItem.item.id)}
                                    data-testid={`button-remove-${cartItem.item.id}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-primary" data-testid="text-cart-total">
                            ${cartTotal.toFixed(2)}
                          </span>
                        </div>
                        <Button 
                          className="w-full" 
                          size="lg" 
                          onClick={handleCheckout}
                          data-testid="button-checkout"
                        >
                          Proceed to Checkout
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      {categories && categories.length > 0 && (
        <div className="sticky top-[73px] z-10 bg-background/95 backdrop-blur border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto py-3">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                data-testid="button-category-all"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  data-testid={`button-category-${category.id}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!filteredItems || filteredItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No items available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => (
              <Card key={item.id} className="overflow-hidden hover-elevate">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img
                    src={item.imageUrl || placeholderImages[idx % placeholderImages.length]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg" data-testid={`text-menu-item-name-${item.id}`}>
                        {item.name}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {item.description}
                      </CardDescription>
                    </div>
                    <span className="text-xl font-bold text-primary whitespace-nowrap">
                      ${item.price}
                    </span>
                  </div>
                  {item.dietaryTags && item.dietaryTags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {item.dietaryTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => addToCart(item)}
                    disabled={!item.isAvailable}
                    data-testid={`button-add-to-cart-${item.id}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
