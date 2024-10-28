import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Page({searchParams}) {
  
   const event_invite_id = searchParams.event_invite_id;

   const supabase = createClient();
   const { error } = await supabase.auth.signOut();
   
   if (error) {
      console.error(error)
      return (
         <div className="text-red-500 text-lg">
            Tapahtui virhe yrittäessä kirjautua ulos.
         </div>
      )
   }
   
   if(!event_invite_id) {
      return redirect("/login");
   }

   return redirect("/register-for-event/" + event_invite_id + "?login=true");
}

