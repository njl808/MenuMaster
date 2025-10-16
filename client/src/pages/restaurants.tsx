import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Settings, Eye, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";
import type { Restaurant, InsertRestaurant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Restaurants() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InsertRestaurant>({
    name: "",
    description: "",
    logoUrl: "",
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
        stripePublishableKey: "",
        stripeSecretKey: "",
        themeConfig: { primaryColor: "#16a34a", accentColor: "#f97316" },
      });
      toast({
        title: "Restaurant created",
        description: "Your restaurant has been created successfully.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-restaurant">
              <Plus className="w-4 h-4 mr-2" />
              Create Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Restaurant</DialogTitle>
                <DialogDescription>
                  Add a new restaurant to start building menus. Stripe keys are optional - menus will work in demo mode without them.
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
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-restaurant">
                  {createMutation.isPending ? "Creating..." : "Create Restaurant"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover-elevate">
              <CardHeader>
                <CardTitle data-testid={`text-restaurant-name-${restaurant.id}`}>{restaurant.name}</CardTitle>
                <CardDescription className="line-clamp-2">{restaurant.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Mode:</span>
                    <span className={`font-medium ${restaurant.stripePublishableKey ? 'text-primary' : 'text-muted-foreground'}`}>
                      {restaurant.stripePublishableKey ? 'Stripe Active' : 'Demo Mode'}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 flex-wrap">
                <Button variant="default" size="sm" asChild data-testid={`button-menu-builder-${restaurant.id}`}>
                  <Link href={`/menu-builder?restaurantId=${restaurant.id}`}>
                    <Settings className="w-3 h-3 mr-1" />
                    Menu Builder
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild data-testid={`button-preview-${restaurant.id}`}>
                  <Link href={`/menu/${restaurant.id}`}>
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild data-testid={`button-embed-${restaurant.id}`}>
                  <Link href={`/embed?restaurantId=${restaurant.id}`}>
                    <Code className="w-3 h-3 mr-1" />
                    Embed
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
