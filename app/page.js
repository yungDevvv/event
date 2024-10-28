import { redirect } from 'next/navigation'
import getAuthUser from "@/lib/supabase/user";
import { RegisterEventMember } from "@/components/forms/register-event-member";
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const user = await getAuthUser();
  const supabase = createClient();

  console.log(user)

  if (user.role === "client") {
    return redirect("/dashboard");
  }

  const { data, error } = await supabase
    .from('event_member')
    .select('*, events(invintation_id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error(error)
    return (
      <div className="flex h-screen w-full items-center justify-center px-4 bg-orange-100">
        <h1 className="text-2xl text-red-500 text-center">SERVER ERROR 500</h1>
      </div>
    )
  }

  if (data && data.length !== 0) {
    return redirect(`/event/${data[0].events.invintation_id}`);
  }
  

  return (
    <div className="flex h-screen w-full items-center justify-center px-4 bg-orange-100">
      <RegisterEventMember user={user} />
      <Loader2 size={55} className='animate-spin text-orange-600' />
    </div>
  );
}

