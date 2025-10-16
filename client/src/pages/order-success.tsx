import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
          <CardDescription>
            Your order has been received and is being processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            You will receive a confirmation email shortly with your order details.
          </p>
          <Button asChild className="w-full" data-testid="button-back-home">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
