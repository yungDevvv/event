import { createClient } from '@/lib/supabase/client';
import useSWRInfinite from 'swr/infinite';


const fetchPosts = async (limit, offset, event_id) => {
   const supabase = createClient();

   const { data, error } = await supabase.
      from('event_posts')
      .select('*, users!user_id(*)')
      .eq('event_id', event_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

   if (error) {
      console.error(error);
      return [];
   }
   
   return data;
};

export function useInfinitePosts(limit = 10, event_id) {

   const { data, mutate, error, size, setSize, isValidating } = useSWRInfinite(
      (index) => ({ limit, offset: index * limit, event_id }), 
      ({ limit, offset, event_id }) => fetchPosts(limit, offset, event_id),
      {
         revalidateAll: false,
         revalidateFirstPage: false,
      }
   );

   const posts = data ? [].concat(...data) : [];
   const isLoading = !data && !error;
   const isReachingEnd = data && data[data.length - 1]?.length < limit;

   return { posts, error, size, setSize, isLoading, isReachingEnd, isValidating, mutate };
}
