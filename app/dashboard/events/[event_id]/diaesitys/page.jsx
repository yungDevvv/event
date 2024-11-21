"use client"

import DiaImage from "@/components/diaesitys-image";
import EventsTable from "@/components/page-components/events-table";
import { Button } from "@/components/ui/button";
import { Error } from "@/components/ui/error";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Loader2, SquareX } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation"
import { Fragment, useEffect, useState } from "react";
import useSWR from "swr";


export default function Page({ params, searchParams }) {
   const supabase = createClient();
   const { event_id } = params;

   const { toast } = useToast();
   const router = useRouter()

   const { data: posts, mutate, isLoading } = useSWR(event_id, async () => {
      const { data, error } = await supabase
         .from("event_posts")
         .select("*, events!event_id(event_name)")
         .eq("event_id", event_id);

      if (error) {
         console.error(error);
         return;
      }

      return data.length !== 0 ? data : null;
   });

   const [selectedPosts, setSelectedPosts] = useState({});

   const handleCheckboxChange = (postId) => {
      setSelectedPosts((prev) => ({
         ...prev,
         [postId]: !prev[postId],
      }));
   };

   const handleSave = async () => {

      const updates = Object.entries(selectedPosts).map(async ([postId, show]) => {

         const { error } = await supabase
            .from("event_posts")
            .update({ show: !show })
            .eq("id", postId);

         if (error) {
            alert(error);
            return;
         }
      });

      await Promise.all(updates);

      const { error } = await supabase.from("events").update({ "diaesitys": true }).eq("id", event_id)

      if (error) {
         console.error(error)
         alert(error);
         return;
      }

      router.push(`/dashboard/events/${event_id}/diaesitys/slider`);
   };

   useEffect(() => {
      if (posts) {
         const canceledPosts = posts.reduce((acc, post) => {
            if (post.show === false) {
               acc[post.id] = true;
            }
            return acc;
         }, {});

         setSelectedPosts(canceledPosts)
      }
      mutate();
   }, [posts])

   useEffect(() => {
      if (searchParams["offline"]) { //if redirected from /diaesitys/slider
         (async () => { // turn off slide show
            const { error } = await supabase
               .from("events")
               .update({ "diaesitys": false })
               .eq("id", event_id)

            if (error) {
               console.error(error);
               toast({
                  variant: "supabaseError",
                  description: "Tuntematon virhe sammutettaessa diaesitystä."
               });
               return;
            }

            toast({
               variant: "success",
               title: "Diaesitys",
               description: "Diaesitys on nyt pysäytetty."
            });
         })()
      }

   }, [])
   return (
      <div className="w-full h-full min-h-screen">
         <h1 className="font-semibold text-2xl mb-3">{posts && posts.length !== 0 && posts[0]?.events?.event_name}</h1>
         {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
               <Loader2 size={46} className="text-zinc-700 animate-spin" />
            </div>
         ) : (
            <Fragment>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {posts && posts.length !== 0
                     ? posts.map(post => <DiaImage key={post.id} post={post} selectedPosts={selectedPosts} handleCheckboxChange={handleCheckboxChange} />)
                     : "Ei ole kuvia vielä."
                  }
               </div>
               {posts && posts.length !== 0 && <Button className="mt-4 text-lg" onClick={() => handleSave()}>Talenna ja aloita diaesitys</Button>}
            </Fragment>
         )}

      </div>
   );
}


