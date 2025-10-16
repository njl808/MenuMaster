import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Restaurant } from "@shared/schema";

export default function Embed() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const restaurantId = params.get("restaurantId");
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  const embedCode = `<iframe
  src="${window.location.origin}/menu/${restaurantId}"
  width="100%"
  height="800"
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({ title: "Embed code copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

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
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Embed Code</h1>
        <p className="text-muted-foreground mt-1">
          {restaurant?.name ? `Embed ${restaurant.name} menu on your website` : "Get embed code for your menu"}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>HTML Embed Code</CardTitle>
            <CardDescription>
              Copy this code and paste it into your website where you want the menu to appear
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono" data-testid="text-embed-code">
                {embedCode}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={handleCopy}
                data-testid="button-copy-embed"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct Link</CardTitle>
            <CardDescription>
              Share this direct link to your menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/menu/${restaurantId}`}
                className="flex-1 px-3 py-2 bg-muted rounded-md text-sm"
                data-testid="input-direct-link"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/menu/${restaurantId}`);
                  toast({ title: "Link copied!" });
                }}
                data-testid="button-copy-link"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your menu will look when embedded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <iframe
                src={`/menu/${restaurantId}`}
                className="w-full h-[600px]"
                title="Menu Preview"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
