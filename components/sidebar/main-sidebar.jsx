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

export function MainSidebar({ user, clientData }) {
  return (
    <Sidebar className="bg-accent/60">
      <SidebarHeader className="justify-center">
        {clientData !== null
          ? <img className="max-h-[100px] h-full" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + clientData.logo} />
          : <span className="text-lg text-orange-500 font-bold">Company Logo</span>
        }
      </SidebarHeader>
      
      {user.role === "client" && <ClientSidebarContent />}
      {user.role === "superadmin" && <AdminSidebarContent />}
      {user.role === "member" && <p className="text-semibold text-lg py-3 text-center">You are member!</p>}
      {/* <ClientSidebarContent /> */}
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
