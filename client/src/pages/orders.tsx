import { useQuery, useMutation } from "@tanstack/react-query";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  preparing: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  ready: "bg-green-500/10 text-green-700 dark:text-green-400",
  completed: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export default function Orders() {
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order status updated" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const groupedOrders = {
    pending: orders?.filter((o) => o.status === "pending") || [],
    confirmed: orders?.filter((o) => o.status === "confirmed") || [],
    preparing: orders?.filter((o) => o.status === "preparing") || [],
    ready: orders?.filter((o) => o.status === "ready") || [],
    completed: orders?.filter((o) => o.status === "completed") || [],
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Orders</h1>
        <p className="text-muted-foreground mt-1">Manage incoming orders and track status</p>
      </div>

      {!orders || orders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-center">
              Orders will appear here when customers place them through your menu
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* New Orders */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              New Orders ({groupedOrders.pending.length})
            </h2>
            {groupedOrders.pending.map((order) => (
              <OrderCard key={order.id} order={order} onUpdateStatus={updateStatusMutation.mutate} />
            ))}
          </div>

          {/* In Progress */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              In Progress ({groupedOrders.confirmed.length + groupedOrders.preparing.length})
            </h2>
            {[...groupedOrders.confirmed, ...groupedOrders.preparing].map((order) => (
              <OrderCard key={order.id} order={order} onUpdateStatus={updateStatusMutation.mutate} />
            ))}
          </div>

          {/* Ready & Completed */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Ready & Done ({groupedOrders.ready.length + groupedOrders.completed.length})
            </h2>
            {[...groupedOrders.ready, ...groupedOrders.completed].map((order) => (
              <OrderCard key={order.id} order={order} onUpdateStatus={updateStatusMutation.mutate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ 
  order, 
  onUpdateStatus 
}: { 
  order: Order; 
  onUpdateStatus: (params: { orderId: string; status: string }) => void;
}) {
  return (
    <Card data-testid={`card-order-${order.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base" data-testid={`text-order-customer-${order.id}`}>
              {order.customerName}
            </CardTitle>
            <CardDescription className="text-xs">
              {format(new Date(order.createdAt), "MMM d, h:mm a")}
            </CardDescription>
          </div>
          <Badge className={statusColors[order.status]} data-testid={`badge-order-status-${order.id}`}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-3 flex justify-between items-center">
          <span className="font-semibold">Total:</span>
          <span className="text-lg font-bold text-primary" data-testid={`text-order-total-${order.id}`}>
            ${order.total}
          </span>
        </div>

        {order.paymentStatus === "demo" && (
          <Badge variant="secondary" className="w-full justify-center">
            Demo Order
          </Badge>
        )}

        {order.status !== "completed" && order.status !== "cancelled" && (
          <Select
            value={order.status}
            onValueChange={(value) => onUpdateStatus({ orderId: order.id, status: value })}
          >
            <SelectTrigger data-testid={`select-order-status-${order.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}
