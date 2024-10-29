import EventsTable from "@/components/events-table";
import { createClient } from "@/lib/supabase/server";
import getAuthUser from "@/lib/supabase/user";

export default async function Page() {
   const user = await getAuthUser();
   const supabase = createClient();
   
   if(user.role === "member") {
      return "You don't have access"
   }

   const {data, error} = await supabase.from("events").select("*").eq("user_id", user.id);

   if(error) {
      console.error(error);
      return (
         <div>
            <p className="text-red-500 text-lg">VIRHE: Sisäinen palvelinvirhe 505</p>
         </div>
      )
   }
   return (
      <div>
         <EventsTable data={data} />
      </div>
   );
}


