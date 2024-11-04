import RegisterForEventForm from "@/components/forms/register-for-event-form";
import { createClient } from "@/lib/supabase/server";

export default async function Page({ params, searchParams }) {
   const { eventId } = params;
   const isLogin = searchParams?.login;

   const supabase = createClient();

   const { data, error } = await supabase
      .from('events')
      .select('id, event_name')
      .eq('invintation_id', eventId);
   
   if (error || data?.length === 0) {
      console.error(error ? error : "")
      return (
         <div className="flex h-screen w-full items-center justify-center px-4 bg-orange-100">
            <h1 className="text-2xl text-red-500 text-center">Tapahtuma ei löytynyt</h1>
         </div>
      )
   }

   if (data?.length !== 0) {
      return (
         <div className="flex h-screen w-full items-center justify-center px-4 bg-orange-100">
            <RegisterForEventForm isLogin={isLogin ? isLogin : false} title={data[0].event_name} event_id={data[0].id} invintation_id={eventId} />
         </div>
      );
   }

}
