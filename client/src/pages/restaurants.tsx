import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Settings, Eye, Code, Palette, Pencil, Trash2, MoreVertical } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";
import type { Restaurant, InsertRestaurant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Restaurants() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState<InsertRestaurant>({
    name: "",
    description: "",
    logoUrl: "",
    bannerUrl: "",
    stripePublishableKey: "",
    stripeSecretKey: "",
    themeConfig: { primaryColor: "#16a34a", accentColor: "#f97316" },
  });

  const { data: restaurants, isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertRestaurant) => {
      const res = await apiRequest("POST", "/api/restaurants", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      setIsDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        logoUrl: "",
        bannerUrl: "",
        stripePublishableKey: "",
        stripeSecretKey: "",
        themeConfig: { primaryColor: "#16a34a", accentColor: "#f97316" },
      });
      toast({
        title: "Restaurant created",
        description: "Click 'Menu Builder' to start adding categories and menu items.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertRestaurant }) => {
      // Build clean update payload - only include fields with values
      const updateData: Record<string, any> = {
        name: data.name,
        description: data.description,
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl,
        themeConfig: data.themeConfig,
      };
      
      // Only include Stripe keys if they have values
      if (data.stripePublishableKey) {
        updateData.stripePublishableKey = data.stripePublishableKey;
      }
      if (data.stripeSecretKey) {
        updateData.stripeSecretKey = data.stripeSecretKey;
      }
      
      const res = await apiRequest("PATCH", `/api/restaurants/${id}`, updateData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      setEditingRestaurant(null);
      setIsDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        logoUrl: "",
        bannerUrl: "",
        stripePublishableKey: "",
        stripeSecretKey: "",
        themeConfig: { primaryColor: "#16a34a", accentColor: "#f97316" },
      });
      toast({
        title: "Restaurant updated",
        description: "Your changes have been saved.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/restaurants/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({
        title: "Restaurant deleted",
        description: "The restaurant has been removed.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRestaurant) {
      updateMutation.mutate({ id: editingRestaurant.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      description: restaurant.description || "",
      logoUrl: restaurant.logoUrl || "",
      bannerUrl: restaurant.bannerUrl || "",
      stripePublishableKey: restaurant.stripePublishableKey || "",
      stripeSecretKey: "", // Don't show existing secret
      themeConfig: restaurant.themeConfig || { primaryColor: "#16a34a", accentColor: "#f97316" },
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Restaurants</h1>
          <p className="text-muted-foreground mt-1">Manage your restaurant menus and settings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            // Reset form and editing state when dialog closes
            setEditingRestaurant(null);
            setFormData({
              name: "",
              description: "",
              logoUrl: "",
              bannerUrl: "",
              stripePublishableKey: "",
              stripeSecretKey: "",
              themeConfig: { primaryColor: "#16a34a", accentColor: "#f97316" },
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                // Reset editing state when creating new restaurant
                setEditingRestaurant(null);
                setFormData({
                  name: "",
                  description: "",
                  logoUrl: "",
                  bannerUrl: "",
                  stripePublishableKey: "",
                  stripeSecretKey: "",
                  themeConfig: { primaryColor: "#16a34a", accentColor: "#f97316" },
                });
              }}
              data-testid="button-create-restaurant"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingRestaurant ? "Edit Restaurant" : "Create New Restaurant"}</DialogTitle>
                <DialogDescription>
                  {editingRestaurant ? "Update your restaurant details and settings." : "Add a new restaurant to start building menus. Stripe keys are optional - menus will work in demo mode without them."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    data-testid="input-restaurant-name"
                    placeholder="Joe's Burgers"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="input-restaurant-description"
                    placeholder="A brief description of your restaurant..."
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Restaurant Logo</Label>
                  <p className="text-sm text-muted-foreground mb-2">Square image recommended (200x200px)</p>
                  <ImageUpload
                    value={formData.logoUrl || ""}
                    onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                    onRemove={() => setFormData({ ...formData, logoUrl: "" })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Banner Image</Label>
                  <p className="text-sm text-muted-foreground mb-2">Wide image recommended (1200x400px)</p>
                  <ImageUpload
                    value={formData.bannerUrl || ""}
                    onChange={(url) => setFormData({ ...formData, bannerUrl: url })}
                    onRemove={() => setFormData({ ...formData, bannerUrl: "" })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripePublishableKey">Stripe Publishable Key (Optional)</Label>
                  <Input
                    id="stripePublishableKey"
                    data-testid="input-stripe-publishable-key"
                    placeholder="pk_test_..."
                    value={formData.stripePublishableKey || ""}
                    onChange={(e) => setFormData({ ...formData, stripePublishableKey: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">Leave empty to use demo checkout mode</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripeSecretKey">Stripe Secret Key (Optional)</Label>
                  <Input
                    id="stripeSecretKey"
                    data-testid="input-stripe-secret-key"
                    type="password"
                    placeholder="sk_test_..."
                    value={formData.stripeSecretKey || ""}
                    onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
                  />
                  {editingRestaurant && (
                    <p className="text-sm text-muted-foreground">Leave empty to keep existing key</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-restaurant">
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingRestaurant ? "Update Restaurant" : "Create Restaurant"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!restaurants || restaurants.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No restaurants yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Create your first restaurant to start building interactive menus with checkout functionality.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold" data-testid={`text-restaurant-name-${restaurant.id}`}>
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {restaurant.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Payment:</span>
                        <span className={`font-medium ${restaurant.stripePublishableKey ? 'text-primary' : 'text-muted-foreground'}`}>
                          {restaurant.stripePublishableKey ? 'Stripe Active' : 'Demo Mode'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="default" size="sm" asChild data-testid={`button-menu-builder-${restaurant.id}`}>
                      <Link href={`/menu-builder?restaurantId=${restaurant.id}`}>
                        <Settings className="w-4 h-4 mr-2" />
                        Menu Builder
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid={`button-restaurant-actions-${restaurant.id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(restaurant)} data-testid={`button-edit-${restaurant.id}`}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Restaurant
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/menu/${restaurant.id}`} data-testid={`button-preview-${restaurant.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview Menu
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/theme?restaurantId=${restaurant.id}`} data-testid={`button-theme-${restaurant.id}`}>
                            <Palette className="w-4 h-4 mr-2" />
                            Theme Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/embed?restaurantId=${restaurant.id}`} data-testid={`button-embed-${restaurant.id}`}>
                            <Code className="w-4 h-4 mr-2" />
                            Embed Code
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              data-testid={`button-delete-${restaurant.id}`}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Restaurant
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Restaurant?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{restaurant.name}" and all its categories, menu items, and data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(restaurant.id)} data-testid={`button-confirm-delete-${restaurant.id}`}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
