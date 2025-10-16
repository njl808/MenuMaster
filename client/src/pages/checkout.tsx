import { useRoute, useLocation as useWouterLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useStripe, Elements, PaymentElement, useElements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowLeft } from "lucide-react";
import type { Restaurant } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface CartItem {
  item: {
    id: string;
    name: string;
    price: string;
  };
  quantity: number;
  specialInstructions?: string;
}

interface CheckoutData {
  restaurantId: string;
  cart: CartItem[];
}

export default function Checkout() {
  const [, params] = useRoute("/checkout/:restaurantId");
  const restaurantId = params?.restaurantId;
  const [, navigate] = useWouterLocation();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  useEffect(() => {
    // Load cart from session storage
    const stored = sessionStorage.getItem("checkout-cart");
    if (stored) {
      const data = JSON.parse(stored);
      setCheckoutData(data);
    }

    // Initialize Stripe if restaurant has keys
    if (restaurant?.stripePublishableKey) {
      setStripePromise(loadStripe(restaurant.stripePublishableKey));
    }
  }, [restaurant]);

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No items in cart</p>
          <Button onClick={() => navigate(`/menu/${restaurantId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  const total = checkoutData.cart.reduce(
    (sum, item) => sum + parseFloat(item.item.price) * item.quantity,
    0
  );

  // If restaurant has Stripe configured, show Stripe checkout
  if (restaurant?.stripePublishableKey && stripePromise) {
    return (
      <StripeCheckout
        restaurant={restaurant}
        checkoutData={checkoutData}
        total={total}
        stripePromise={stripePromise}
      />
    );
  }

  // Otherwise, show demo checkout
  return (
    <DemoCheckout
      restaurant={restaurant}
      checkoutData={checkoutData}
      total={total}
    />
  );
}

function StripeCheckout({
  restaurant,
  checkoutData,
  total,
  stripePromise,
}: {
  restaurant: Restaurant | undefined;
  checkoutData: CheckoutData;
  total: number;
  stripePromise: Promise<Stripe | null>;
}) {
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Create payment intent
    apiRequest("POST", "/api/create-payment-intent", {
      restaurantId: checkoutData.restaurantId,
      amount: total,
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to initialize payment");
        }
        return res.json();
      })
      .then((data) => setClientSecret(data.clientSecret))
      .catch((error) => {
        toast({
          title: "Payment Setup Error",
          description: error.message || "Stripe is not configured for this restaurant. Please use demo mode.",
          variant: "destructive",
        });
        // Fallback to demo mode if Stripe fails
        setTimeout(() => {
          window.location.href = `/checkout/${checkoutData.restaurantId}`;
        }, 2000);
      });
  }, [checkoutData.restaurantId, total, toast]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeCheckoutForm
        restaurant={restaurant}
        checkoutData={checkoutData}
        total={total}
        clientSecret={clientSecret}
      />
    </Elements>
  );
}

function StripeCheckoutForm({
  restaurant,
  checkoutData,
  total,
  clientSecret,
}: {
  restaurant: Restaurant | undefined;
  checkoutData: CheckoutData;
  total: number;
  clientSecret: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useWouterLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
        receipt_email: customerInfo.email,
      },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      // Create order
      await apiRequest("POST", "/api/orders", {
        restaurantId: checkoutData.restaurantId,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        items: checkoutData.cart.map((c) => ({
          itemId: c.item.id,
          name: c.item.name,
          price: c.item.price,
          quantity: c.quantity,
          modifiers: [],
          specialInstructions: c.specialInstructions,
        })),
        subtotal: total.toFixed(2),
        tax: "0.00",
        total: total.toFixed(2),
        paymentStatus: "paid",
      });

      sessionStorage.removeItem("checkout-cart");
      navigate("/order-success");
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/menu/${checkoutData.restaurantId}`)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      data-testid="input-customer-name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      data-testid="input-customer-email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      data-testid="input-customer-phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentElement />
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isProcessing || !stripe || !elements}
                data-testid="button-place-order"
              >
                {isProcessing ? "Processing..." : `Pay £${total.toFixed(2)}`}
              </Button>
            </form>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>{restaurant?.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {checkoutData.cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-sm">
                      {item.quantity}x {item.item.name}
                    </span>
                    <span className="text-sm font-medium">
                      £{(parseFloat(item.item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">£{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoCheckout({
  restaurant,
  checkoutData,
  total,
}: {
  restaurant: Restaurant | undefined;
  checkoutData: CheckoutData;
  total: number;
}) {
  const { toast } = useToast();
  const [, navigate] = useWouterLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const placeDemoOrder = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return res.json();
    },
    onSuccess: () => {
      sessionStorage.removeItem("checkout-cart");
      navigate("/order-success");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    await placeDemoOrder.mutateAsync({
      restaurantId: checkoutData.restaurantId,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      items: checkoutData.cart.map((c) => ({
        itemId: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity,
        modifiers: [],
        specialInstructions: c.specialInstructions,
      })),
      subtotal: total.toFixed(2),
      tax: "0.00",
      total: total.toFixed(2),
      paymentStatus: "demo",
    });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/menu/${checkoutData.restaurantId}`)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout (Demo Mode)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  This restaurant is running in demo mode. No actual payment will be processed.
                </p>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      data-testid="input-customer-name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      data-testid="input-customer-email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      data-testid="input-customer-phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isProcessing}
                data-testid="button-place-order"
              >
                {isProcessing ? "Processing..." : `Place Demo Order - £${total.toFixed(2)}`}
              </Button>
            </form>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>{restaurant?.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {checkoutData.cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-sm">
                      {item.quantity}x {item.item.name}
                    </span>
                    <span className="text-sm font-medium">
                      £{(parseFloat(item.item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">£{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
