import EventsTable from "@/components/events-table";
import { createClient } from "@/lib/supabase/server";
import getAuthUser from "@/lib/supabase/user";

export default async function Page() {
   const user = await getAuthUser();
   
   if(user.role === "member") {
      return "You don't have access"
   }

   return (
      <div>
         <EventsTable data={data} />
      </div>
   );
}


