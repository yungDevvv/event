import { MainSidebar } from "@/components/sidebar/main-sidebar"
import { Toaster } from "@/components/ui/toaster"
import {
  SidebarLayout,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import getAuthUser from "@/lib/supabase/user";
import { ModalProvider } from "@/components/providers/modal-provider";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }) {
  // const { cookies } = await import("next/headers")
  const supabase = createClient();
  const user = await getAuthUser();
  const user1 = await supabase.from("users").select("*").eq("id", user.id)
  return (
    // <SidebarLayout defaultOpen={cookies().get("sidebar:state")?.value === "true"}>
    <SidebarLayout defaultOpen={true}>
      <MainSidebar user={user} user1={user1} />
      <main
        className="flex flex-1 flex-col p-6 max-lg:p-2 transition-all duration-300 ease-in-out">
        <div className="h-full">
          <SidebarTrigger />
          {children}
        </div>
      </main>
      <Toaster />
      <ModalProvider />
    </SidebarLayout>
  );
}