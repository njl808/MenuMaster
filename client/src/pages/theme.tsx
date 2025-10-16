import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Restaurant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Theme() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const restaurantId = params.get("restaurantId");
  const { toast } = useToast();

  const [primaryColor, setPrimaryColor] = useState("#16a34a");
  const [accentColor, setAccentColor] = useState("#f97316");

  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  useEffect(() => {
    if (restaurant?.themeConfig) {
      setPrimaryColor(restaurant.themeConfig.primaryColor || "#16a34a");
      setAccentColor(restaurant.themeConfig.accentColor || "#f97316");
    }
  }, [restaurant]);

  const updateTheme = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("PATCH", `/api/restaurants/${restaurantId}`, {
        themeConfig: {
          primaryColor,
          accentColor,
        },
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      toast({
        title: "Theme updated successfully!",
        description: "Your menu colors have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update theme",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!restaurantId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Please select a restaurant first</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Theme Customization</h1>
        <p className="text-muted-foreground mt-1">
          {restaurant?.name ? `Customize ${restaurant.name}'s menu colors` : "Customize your menu colors"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Settings
            </CardTitle>
            <CardDescription>
              Choose colors that match your brand. Changes will apply to your customer-facing menu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                  data-testid="input-primary-color"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="font-mono"
                  placeholder="#16a34a"
                  data-testid="input-primary-color-text"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Used for primary buttons, links, and accents
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="accent-color"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                  data-testid="input-accent-color"
                />
                <Input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="font-mono"
                  placeholder="#f97316"
                  data-testid="input-accent-color-text"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Used for secondary elements and highlights
              </p>
            </div>

            <Button
              onClick={() => updateTheme.mutate()}
              disabled={updateTheme.isPending}
              className="w-full"
              data-testid="button-save-theme"
            >
              {updateTheme.isPending ? "Saving..." : "Save Theme"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your colors will look on the menu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 rounded-lg border bg-background">
              <h3 className="text-lg font-semibold mb-4">Sample Menu Item</h3>
              <div className="space-y-3">
                <Button 
                  style={{ backgroundColor: primaryColor, color: "white" }}
                  className="w-full"
                >
                  Primary Button (Add to Cart)
                </Button>
                <Button 
                  variant="outline"
                  style={{ borderColor: accentColor, color: accentColor }}
                  className="w-full"
                >
                  Accent Button (View Details)
                </Button>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="text-sm text-muted-foreground">Primary color dot</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span className="text-sm text-muted-foreground">Accent color dot</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
