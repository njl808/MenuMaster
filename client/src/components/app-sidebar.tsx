import { Store, UtensilsCrossed, ShoppingBag, Palette, Code, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Restaurants",
    url: "/",
    icon: Store,
  },
  {
    title: "Menu Builder",
    url: "/menu-builder",
    icon: UtensilsCrossed,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingBag,
  },
  {
    title: "Theme & Embed",
    url: "/customize",
    icon: Palette,
  },
  {
    title: "Embed Code",
    url: "/embed",
    icon: Code,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold px-2 mb-2">
            <UtensilsCrossed className="w-5 h-5 mr-2 inline-block" />
            Menu System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive}>
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
