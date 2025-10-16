import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Restaurants from "@/pages/restaurants";
import MenuBuilder from "@/pages/menu-builder";
import Orders from "@/pages/orders";
import Embed from "@/pages/embed";
import CustomerMenu from "@/pages/customer-menu";
import Checkout from "@/pages/checkout";
import OrderSuccess from "@/pages/order-success";

function AdminRouter() {
  return (
    <Switch>
      <Route path="/" component={Restaurants} />
      <Route path="/menu-builder" component={MenuBuilder} />
      <Route path="/orders" component={Orders} />
      <Route path="/embed" component={Embed} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Custom sidebar width
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          {/* Public customer-facing routes */}
          <Route path="/menu/:restaurantId" component={CustomerMenu} />
          <Route path="/checkout/:restaurantId" component={Checkout} />
          <Route path="/order-success" component={OrderSuccess} />

          {/* Admin routes with sidebar */}
          <Route>
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1">
                  <header className="flex items-center justify-between p-3 border-b">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <ThemeToggle />
                  </header>
                  <main className="flex-1 overflow-auto">
                    <AdminRouter />
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </Route>
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
