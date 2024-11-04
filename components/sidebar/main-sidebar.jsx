"use client"

import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

import ClientSidebarContent from "./roles/client-sidebar-content"
import AdminSidebarContent from "./roles/admin-sidebar-content"

const data = {
  user: {
    name: "John Smit",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

export function MainSidebar({ user, user1 }) {
  // console.log(user)
  return (
    <Sidebar>
      <SidebarHeader>
        <span className="text-lg text-orange-500 font-bold">Company Logo</span>
      </SidebarHeader>
        {user1.data[0].role === "client" && <ClientSidebarContent />} 
        {user1.data[0].role === "superadmin" && <AdminSidebarContent />}
        {user1.data[0].role === "member" && <p className="text-semibold text-lg py-3 text-center">You are member!</p>} 
        {/* <ClientSidebarContent /> */}
      <SidebarFooter>
        <NavUser user={user1.data[0]} />
      </SidebarFooter>
    </Sidebar>
  );
}
