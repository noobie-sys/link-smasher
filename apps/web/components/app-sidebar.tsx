"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  CircleHelp,
  Folder,
  Sparkles,
} from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const user = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || "",
      }
    : {
        name: "Loading...",
        email: "",
        avatar: "",
      };

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: <Folder className="size-4" />,
    },
    {
      title: "Simulator",
      url: "/simulator",
      icon: <Sparkles className="size-4" />,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: <BarChart3 className="size-4" />,
    },
  ];

  const navSecondary = [
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings className="size-4" />,
    },
    {
      title: "Get Help",
      url: "#",
      icon: <CircleHelp className="size-4" />,
    },
  ];

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      className="  bg-card/45 backdrop-blur-xl"
    >
      <SidebarHeader className="border-b border-border/50 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! hover:bg-transparent"
            >
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="Lyncflow"
                  className="h-9 w-9 shrink-0 rounded-xl object-cover"
                />
                <span className="font-display font-bold text-sm tracking-tight text-foreground">
                  Lync
                  <span className="bg-gradient-to-r from-primary to-brand-magenta bg-clip-text text-transparent">
                    flow
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 py-2 gap-2">
        <div className="flex items-center justify-between px-3.5 py-1.5 rounded-lg hover:bg-sidebar-accent/30 text-sidebar-foreground transition-colors">
          <span className="text-xs font-medium text-muted-foreground">
            Theme
          </span>
          <ModeToggle />
        </div>
        <NavSecondary items={navSecondary} className="mb-1" />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
