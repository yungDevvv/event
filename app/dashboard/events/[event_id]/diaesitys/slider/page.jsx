import { createClient } from "@/lib/supabase/server";
import FullscreenCarousel from "@/components/page-components/fullscreen-carousel";


export default async function Page({ params }) {
   const supabase = createClient();
   const { event_id } = params;

   const { data: event, error: eventError } = await supabase
      .from("events")
      .select("diaesitys")
      .eq("id", event_id);

   if (eventError) {
      return (
         <div>
            {error.message}
         </div>
      )
   }

   if (event[0].diaesitys === false) {
      return (
         <div className="w-full h-full fixed flex items-center justify-center top-0 bottom-0 right-0 left-0 z-50 bg-black">
            <h1 className="text-white text-2xl">Diaesitys on pysähdetty</h1>
         </div>
      );
   }

   return (
      <div className="w-full h-full fixed top-0 bottom-0 right-0 left-0 z-50 bg-black">
         <FullscreenCarousel event_id={event_id} />
      </div>
   );
}


