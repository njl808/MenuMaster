import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Palette, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Restaurant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLOR_PRESETS = {
  primary: [
    { name: "Forest Green", value: "#16a34a" },
    { name: "Royal Blue", value: "#2563eb" },
    { name: "Deep Purple", value: "#7c3aed" },
    { name: "Crimson Red", value: "#dc2626" },
    { name: "Teal", value: "#0d9488" },
    { name: "Indigo", value: "#4f46e5" },
  ],
  accent: [
    { name: "Warm Orange", value: "#f97316" },
    { name: "Golden Yellow", value: "#eab308" },
    { name: "Pink", value: "#ec4899" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Rose", value: "#f43f5e" },
  ],
};

export default function Theme() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const restaurantId = params.get("restaurantId");
  const { toast } = useToast();

  const [primaryColor, setPrimaryColor] = useState("#16a34a");
  const [accentColor, setAccentColor] = useState("#f97316");
  const [mode, setMode] = useState<"light" | "dark">("light");

  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  useEffect(() => {
    if (restaurant?.themeConfig) {
      setPrimaryColor(restaurant.themeConfig.primaryColor || "#16a34a");
      setAccentColor(restaurant.themeConfig.accentColor || "#f97316");
      setMode(restaurant.themeConfig.mode || "light");
    }
  }, [restaurant]);

  const updateTheme = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("PATCH", `/api/restaurants/${restaurantId}`, {
        themeConfig: {
          primaryColor,
          accentColor,
          mode,
        },
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      toast({
        title: "Theme updated successfully!",
        description: "Your menu colors and appearance have been saved.",
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Theme Customization</h1>
        <p className="text-muted-foreground mt-1">
          {restaurant?.name ? `Customize ${restaurant.name}'s menu appearance` : "Customize your menu appearance"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Color Settings
              </CardTitle>
              <CardDescription>
                Choose colors that match your brand. Use the color picker or select from presets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
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
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_PRESETS.primary.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setPrimaryColor(preset.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border hover-elevate transition-colors ${
                        primaryColor === preset.value ? "border-primary" : "border-border"
                      }`}
                      data-testid={`button-preset-primary-${preset.name.toLowerCase().replace(" ", "-")}`}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.value }}
                      />
                      <span className="text-xs">{preset.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Used for primary buttons, links, and key accents
                </p>
              </div>

              <div className="space-y-3">
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
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_PRESETS.accent.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setAccentColor(preset.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border hover-elevate transition-colors ${
                        accentColor === preset.value ? "border-primary" : "border-border"
                      }`}
                      data-testid={`button-preset-accent-${preset.name.toLowerCase().replace(" ", "-")}`}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.value }}
                      />
                      <span className="text-xs">{preset.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Used for secondary elements and highlights
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {mode === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                Appearance Mode
              </CardTitle>
              <CardDescription>
                Choose how your menu appears to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant={mode === "light" ? "default" : "outline"}
                  onClick={() => setMode("light")}
                  className="flex-1"
                  data-testid="button-mode-light"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Light Mode
                </Button>
                <Button
                  variant={mode === "dark" ? "default" : "outline"}
                  onClick={() => setMode("dark")}
                  className="flex-1"
                  data-testid="button-mode-dark"
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Dark Mode
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => updateTheme.mutate()}
            disabled={updateTheme.isPending}
            className="w-full"
            size="lg"
            data-testid="button-save-theme"
          >
            {updateTheme.isPending ? "Saving..." : "Save Theme"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your theme will look to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={mode} value={mode} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="light" onClick={() => setMode("light")}>Light</TabsTrigger>
                <TabsTrigger value="dark" onClick={() => setMode("dark")}>Dark</TabsTrigger>
              </TabsList>
              
              <TabsContent value="light" className="mt-4">
                <div className="bg-white text-gray-900 p-6 rounded-lg border space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Delicious Pizza</h3>
                    <p className="text-sm text-gray-600">Fresh mozzarella, tomato sauce, and basil</p>
                    <p className="text-lg font-bold">£12.99</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      style={{ backgroundColor: primaryColor, color: "white" }}
                      className="w-full"
                    >
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline"
                      style={{ borderColor: accentColor, color: accentColor }}
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-sm text-gray-500">Primary accent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                    <span className="text-sm text-gray-500">Secondary accent</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="dark" className="mt-4">
                <div className="bg-gray-900 text-white p-6 rounded-lg border border-gray-800 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Delicious Pizza</h3>
                    <p className="text-sm text-gray-400">Fresh mozzarella, tomato sauce, and basil</p>
                    <p className="text-lg font-bold">£12.99</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      style={{ backgroundColor: primaryColor, color: "white" }}
                      className="w-full"
                    >
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline"
                      style={{ 
                        borderColor: accentColor, 
                        color: accentColor,
                        backgroundColor: "transparent"
                      }}
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-sm text-gray-500">Primary accent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                    <span className="text-sm text-gray-500">Secondary accent</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
