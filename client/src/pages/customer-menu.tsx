import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ShoppingCart, Plus, Minus, Trash2, X, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import { useLocation as useWouterLocation } from "wouter";
import type { Restaurant, Category, MenuItem, ModifierGroup, Modifier } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

import burgerImg from "@assets/generated_images/Gourmet_burger_food_photo_be0260fb.png";
import saladImg from "@assets/generated_images/Caesar_salad_food_photo_f979d014.png";
import pizzaImg from "@assets/generated_images/Margherita_pizza_food_photo_9c7d96a3.png";
import salmonImg from "@assets/generated_images/Grilled_salmon_food_photo_b962d180.png";

const placeholderImages = [burgerImg, saladImg, pizzaImg, salmonImg];

// Convert hex color to HSL format for CSS variables
function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

interface CartItem {
  cartItemId: string;
  item: MenuItem;
  quantity: number;
  specialInstructions?: string;
  selectedModifiers: Record<string, Modifier[]>;
  finalPrice: number;
}

export default function CustomerMenu() {
  const [, params] = useRoute("/menu/:restaurantId");
  const restaurantId = params?.restaurantId;
  const [, navigate] = useWouterLocation();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // State for modifier dialog
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModifierDialogOpen, setIsModifierDialogOpen] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, Modifier[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState("");

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

  const { data: modifierGroups, isLoading: groupsLoading } = useQuery<ModifierGroup[]>({
    queryKey: ["/api/modifier-groups", selectedItem?.id],
    enabled: !!selectedItem,
  });

  const addToCart = (itemToAdd: MenuItem, mods: Record<string, Modifier[]>, instructions: string, price: number) => {
    const newCartItem: CartItem = {
      cartItemId: `${itemToAdd.id}-${Date.now()}`,
      item: itemToAdd,
      quantity: 1,
      selectedModifiers: mods,
      specialInstructions: instructions,
      finalPrice: price,
    };
    setCart(prevCart => [...prevCart, newCartItem]);
    toast({ title: `${itemToAdd.name} added to cart` });
    setIsModifierDialogOpen(false);
    setSelectedItem(null);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    const newCart = cart.map((c) =>
      c.cartItemId === cartItemId ? { ...c, quantity: c.quantity + delta } : c
    ).filter((c) => c.quantity > 0);
    setCart(newCart);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter((c) => c.cartItemId !== cartItemId));
  };

  const handleAddToCartClick = (item: MenuItem) => {
    setSelectedItem(item);
  };

  useEffect(() => {
    if (!selectedItem || groupsLoading) return;

    if (modifierGroups && modifierGroups.length > 0) {
      setSelectedModifiers({});
      setSpecialInstructions("");
      setIsModifierDialogOpen(true);
    } else {
      const existingIndex = cart.findIndex(c => c.item.id === selectedItem.id && Object.keys(c.selectedModifiers).length === 0);
      if (existingIndex > -1) {
        updateQuantity(cart[existingIndex].cartItemId, 1);
      } else {
        const newCartItem: CartItem = {
          cartItemId: `${selectedItem.id}-${Date.now()}`,
          item: selectedItem,
          quantity: 1,
          selectedModifiers: {},
          finalPrice: parseFloat(selectedItem.price),
          specialInstructions: '',
        };
        setCart(prev => [...prev, newCartItem]);
      }
      toast({ title: `${selectedItem.name} added to cart` });
      setSelectedItem(null);
    }
  }, [selectedItem, modifierGroups, groupsLoading]);


  const cartTotal = cart.reduce((sum, c) => sum + c.finalPrice * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  // Filter items by selected category (or show all)
  const filteredItems = selectedCategory
    ? allItems?.filter((item) => item.categoryId === selectedCategory)
    : allItems;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Store cart in sessionStorage for checkout page
    sessionStorage.setItem("checkout-cart", JSON.stringify({ restaurantId, cart }));
    navigate(`/checkout/${restaurantId}`);
  };

  const modifierPrice = useMemo(() => {
    if (!selectedItem) return 0;
    return Object.values(selectedModifiers).flat().reduce((sum, mod) => sum + parseFloat(mod.priceAdjustment), 0);
  }, [selectedModifiers, selectedItem]);

  const finalItemPrice = useMemo(() => {
    if (!selectedItem) return 0;
    return parseFloat(selectedItem.price) + modifierPrice;
  }, [selectedItem, modifierPrice]);

  const handleModifierChange = (group: ModifierGroup, modifier: Modifier, checked: boolean) => {
    setSelectedModifiers(prev => {
      const newSelections = { ...prev };
      const currentGroupSelections = newSelections[group.id] || [];

      if (group.selectionType === 'single') {
        newSelections[group.id] = [modifier];
      } else { // multiple
        if (checked) {
          if (!group.maxSelections || currentGroupSelections.length < group.maxSelections) {
            newSelections[group.id] = [...currentGroupSelections, modifier];
          } else {
            toast({
              title: `Maximum ${group.maxSelections} selections allowed for ${group.name}.`,
              variant: "destructive",
            });
            // This is a bit of a hack to prevent the UI from showing a checked state when it's not
            // A better solution would be to control the component fully
            setTimeout(() => {
              const checkbox = document.getElementById(`mod-${modifier.id}`) as HTMLInputElement;
              if (checkbox) checkbox.checked = false;
            }, 10);
          }
        } else {
          newSelections[group.id] = currentGroupSelections.filter(m => m.id !== modifier.id);
        }
      }
      return newSelections;
    });
  };

  const isSelectionValid = useMemo(() => {
    if (!modifierGroups) return true;
    for (const group of modifierGroups) {
      const selections = selectedModifiers[group.id] || [];
      if (group.isRequired && selections.length === 0) return false;
      if (group.minSelections && selections.length < group.minSelections) return false;
    }
    return true;
  }, [modifierGroups, selectedModifiers]);


  // Apply restaurant theme
  useEffect(() => {
    if (restaurant?.themeConfig) {
      const { primaryColor, accentColor, mode } = restaurant.themeConfig;
      
      if (primaryColor) {
        const hsl = hexToHSL(primaryColor);
        document.documentElement.style.setProperty('--primary', hsl);
      }
      if (accentColor) {
        const hsl = hexToHSL(accentColor);
        document.documentElement.style.setProperty('--accent', hsl);
      }
      
      // Apply dark mode if configured
      if (mode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    return () => {
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.classList.remove("dark");
    };
  }, [restaurant]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      {restaurant?.bannerUrl && (
        <div className="relative h-40 sm:h-48 w-full overflow-hidden">
          <img 
            src={restaurant.bannerUrl} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {restaurant?.logoUrl && (
                <div className="flex-shrink-0">
                  <img 
                    src={restaurant.logoUrl} 
                    alt={`${restaurant.name} logo`}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border-2 border-border shadow-sm"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate" data-testid="text-restaurant-name">
                  {restaurant?.name || "Menu"}
                </h1>
                {restaurant?.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {restaurant.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">4.5</span>
                    <span className="text-sm text-muted-foreground">(200+ reviews)</span>
                  </div>
                  <span className="text-sm text-muted-foreground">• 15-25 min delivery</span>
                </div>
              </div>
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
                          <Card key={cartItem.cartItemId}>
                            <CardContent className="p-3">
                              <div className="flex gap-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{cartItem.item.name}</h4>
                                  {Object.values(cartItem.selectedModifiers).flat().length > 0 && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {Object.values(cartItem.selectedModifiers).flat().map(m => m.name).join(', ')}
                                    </div>
                                  )}
                                  <p className="text-sm text-primary font-semibold mt-1">
                                    £{(cartItem.finalPrice * cartItem.quantity).toFixed(2)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(cartItem.cartItemId, -1)}
                                    data-testid={`button-decrease-${cartItem.cartItemId}`}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">{cartItem.quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(cartItem.cartItemId, 1)}
                                    data-testid={`button-increase-${cartItem.cartItemId}`}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => removeFromCart(cartItem.cartItemId)}
                                    data-testid={`button-remove-${cartItem.cartItemId}`}
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
                            £{cartTotal.toFixed(2)}
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

      {/* Category Tabs - Horizontal Scrollable */}
      {categories && categories.length > 0 && (
        <div className="sticky top-[120px] sm:top-[130px] z-10 bg-background/95 backdrop-blur border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap flex-shrink-0"
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
                  className="whitespace-nowrap flex-shrink-0"
                  data-testid={`button-category-${category.id}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!filteredItems || filteredItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No items available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item, idx) => (
              <Card 
                key={item.id} 
                className="overflow-hidden hover-elevate"
                data-testid={`card-menu-item-${item.id}`}
              >
                <div className="relative overflow-hidden bg-muted aspect-[4/3]">
                  <img
                    src={item.imageUrl || placeholderImages[idx % placeholderImages.length]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary">Unavailable</Badge>
                    </div>
                  )}
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold leading-tight" data-testid={`text-menu-item-name-${item.id}`}>
                      {item.name}
                    </CardTitle>
                    <span className="text-lg font-bold text-primary whitespace-nowrap">
                      £{item.price}
                    </span>
                  </div>
                  {item.description && (
                    <CardDescription className="text-sm mt-1 line-clamp-2">
                      {item.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {item.dietaryTags && item.dietaryTags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-3">
                      {item.dietaryTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddToCartClick(item)}
                    disabled={!item.isAvailable}
                    data-testid={`button-add-to-cart-${item.id}`}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modifier Selection Dialog */}
      <Dialog open={isModifierDialogOpen} onOpenChange={(open) => {
        if (!open) setSelectedItem(null);
        setIsModifierDialogOpen(open);
      }}>
        <DialogContent className="max-w-md">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
                <DialogDescription>{selectedItem.description}</DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto space-y-4 p-1">
                {groupsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  modifierGroups?.map((group) => (
                    <ModifierGroupComponent
                      key={group.id}
                      group={group}
                      selectedModifiers={selectedModifiers[group.id] || []}
                      handleModifierChange={(modifier, checked) => handleModifierChange(group, modifier, checked)}
                    />
                  ))
                )}
                <div className="space-y-2">
                  <Label htmlFor="special-instructions">Special Instructions</Label>
                  <Textarea
                    id="special-instructions"
                    placeholder="e.g., no onions, extra sauce..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!isSelectionValid}
                  onClick={() => addToCart(selectedItem, selectedModifiers, specialInstructions, finalItemPrice)}
                >
                  Add to Cart for £{finalItemPrice.toFixed(2)}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ModifierGroupComponent = ({ group, selectedModifiers, handleModifierChange }: {
  group: ModifierGroup,
  selectedModifiers: Modifier[],
  handleModifierChange: (modifier: Modifier, checked: boolean) => void
}) => {
  const { data: modifiers, isLoading } = useQuery<Modifier[]>({
    queryKey: ['/api/modifiers', group.id],
  });

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="h-4 bg-muted rounded w-1/2 mb-2" />
        <div className="h-3 bg-muted rounded w-1/4" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{group.name}</CardTitle>
        <CardDescription>
          {group.selectionType === 'single' ? 'Select one' : `Select up to ${group.maxSelections || 'any'}`}
          {group.isRequired && <span className="text-destructive"> *Required</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {group.selectionType === 'single' ? (
          <RadioGroup
            value={selectedModifiers[0]?.id}
            onValueChange={(modifierId) => {
              const modifier = modifiers?.find(m => m.id === modifierId);
              if (modifier) handleModifierChange(modifier, true);
            }}
          >
            {modifiers?.map(modifier => (
              <div key={modifier.id} className="flex items-center justify-between">
                <Label htmlFor={`mod-${modifier.id}`} className="flex-1 cursor-pointer py-2">
                  {modifier.name}
                </Label>
                <div className="flex items-center gap-2">
                  {parseFloat(modifier.priceAdjustment) > 0 && (
                    <span className="text-sm text-muted-foreground">+£{modifier.priceAdjustment}</span>
                  )}
                  <RadioGroupItem value={modifier.id} id={`mod-${modifier.id}`} />
                </div>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-2">
            {modifiers?.map(modifier => (
              <div key={modifier.id} className="flex items-center justify-between">
                <Label htmlFor={`mod-${modifier.id}`} className="flex-1 cursor-pointer py-2">
                  {modifier.name}
                </Label>
                <div className="flex items-center gap-2">
                  {parseFloat(modifier.priceAdjustment) > 0 && (
                    <span className="text-sm text-muted-foreground">+£{modifier.priceAdjustment}</span>
                  )}
                  <Checkbox
                    id={`mod-${modifier.id}`}
                    checked={selectedModifiers.some(m => m.id === modifier.id)}
                    onCheckedChange={(checked) => handleModifierChange(modifier, !!checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
