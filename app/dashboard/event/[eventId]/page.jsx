
import { createClient } from "@/lib/supabase/server";
import getAuthUser from "@/lib/supabase/user";

export default async function Page({params}) {
  const user = await getAuthUser();
  const supabase = createClient();

  const { eventId } = params;

  const eventExists = await supabase
  .from('events')
  .select('*')  
  .eq('invintation_id', eventId)  
  .maybeSingle();

  if(eventExists && eventExists.error) {
    console.error(eventExists.error);
    return (
      <div className="flex h-full w-full items-center justify-center px-4 bg-orange-100">
        <h1 className="text-2xl text-red-500 font-semibold">Oops, tapahtui virhe!</h1>
      </div>
    )
  }

  if(eventExists && !eventExists.data) {
    return (
      <div className="flex h-full w-full items-center justify-center px-4 bg-orange-100">
        <h1 className="text-2xl text-red-500 font-semibold">Tapahtuma ei löydy</h1>
      </div>
    )
  }

  const memberExists = await supabase
  .from('event_member')
  .select('id')  
  .eq('event_id', eventExists.data.id)  
  .eq('user_id', user.id)  
  .maybeSingle();
 
  if(memberExists && memberExists.error) {
    console.error(memberExists.error);
    return (
      <div className="flex h-full w-full items-center justify-center px-4 bg-orange-100">
        <h1 className="text-2xl text-red-500 font-semibold">Oops, tapahtui virhe!</h1>
      </div>
    )
  }

  if(memberExists && !memberExists.data) {
    return (
      <div className="flex h-full w-full items-center justify-center px-4 bg-orange-100">
        <h1 className="text-2xl text-red-500 font-semibold">Et ole tämän tapahtuman osallistuja.</h1>
      </div>
    )
  }


  console.log(eventExists)
  return (
    <div>
      <h1>{eventExists.data.event_name}</h1>
      <div>
        
      </div>
    </div>
  );
}

