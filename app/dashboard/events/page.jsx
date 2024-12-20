import EventsTable from "@/components/page-components/events-table";
import { Error } from "@/components/ui/error";
import { createClient } from "@/lib/supabase/server";
import getAuthUser from "@/lib/supabase/user";

export default async function Page() {
   const user = await getAuthUser();
   const supabase = createClient();

   if (user.role === "member") {
      return "You don't have access"
   }

   const { data: events, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user.id);

   if (eventError) {
      console.error(eventError);
      return <Error text="500 Internal Server Error" />
   }

   const eventsWithCountsWithReports = await Promise.all(events.map(async (event) => {
      const { count: membersCount } = await supabase
         .from('event_member')
         .select('*', { count: 'exact' })
         .eq('event_id', event.id);

      const { data } = await supabase
         .from('event_posts')
         .select('id')
         .eq('event_id', event.id)
         .eq('report_status', "waiting")
         .eq('is_reported', true)
       
      if (data.length !== 0) {
         return { ...event, memberCount: membersCount || 0, reportsCount: data.length || 0, reportedPosts: [...data] };
      }

      return { ...event, memberCount: membersCount || 0 };
   }));

   return (
      <EventsTable data={eventsWithCountsWithReports} user={user} />
   );
}


