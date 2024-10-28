import { createClient } from "@/lib/supabase/server";
import getAuthUser from "@/lib/supabase/user";

export default async function Page() {
  const user = await getAuthUser();
  const supabase = createClient();

  
  // const { data, error } = await supabase
  //     .from('events')
  //     .select('*')
  //     .eq('id', user.user_metadata.event.event_id)
  //     .single();

  // console.log(data)
  return (
    <div>
     
      {/* <h1 className="text-2xl">{data.event_name}</h1> */}
    </div>
  );
}


