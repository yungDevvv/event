"use client"

import '../../../custom.css'
import UploadImage from "@/components/forms/upload-image";
import { PostList } from "@/components/post-list";
import { useEventContext } from "@/context/EventContext";
import { useInfinitePosts } from "@/hooks/use-infinity-posts"
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTabs } from "@/hooks/use-tabs";
import { MoveLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation"

export default function Page() {
   const { eventData, userData } = useEventContext();
   // console.log(process.env.SUPABASE_HOST,
   //    process.env.SUPABASE_ANON_KEY, "asdasdad")
   

   const router = useRouter();
   const { tab, setTab } = useTabs();
   const { posts, isLoading, setSize, isReachingEnd, isValidating, mutate } = useInfinitePosts(2, eventData.id);

   const [favoritesList, setFavoritesList] = useState([]);
   const [hasNewPosts, setHasNewPosts] = useState(false);

   useEffect(() => {
      if (favoritesList.length !== 0) {
         localStorage.setItem("event-app-image-fav", JSON.stringify(favoritesList));
      }
     
   }, [favoritesList]);

   useEffect(() => {
      const storedFavorites = JSON.parse(localStorage.getItem("event-app-image-fav")) || [];
      setFavoritesList(storedFavorites);
   }, []);

   const addToFavorites = (post) => {
      if (favoritesList.includes(post.id)) {
         setFavoritesList(favoritesList.filter(id => id !== post.id));
      } else {
         setFavoritesList([post.id, ...favoritesList]);
      }
   };


   useEffect(() => {
      const handleScroll = () => {
         if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !isReachingEnd && !isValidating) {
            setSize((prevSize) => prevSize + 1);
         }
      };

      window.addEventListener('scroll', handleScroll);

      return () => window.removeEventListener('scroll', handleScroll);
   }, [isReachingEnd, isValidating, setSize]);

   const filteredList = posts.filter(post => {
      if (tab === "favorites") return favoritesList.includes(post.id);
      if (tab === "my") return post.user_id === userData.id;
      return true; // all posts
   });

   if (!eventData) return "Event ID is missing!";
   
   return (
      <div className="bg-gray-100 min-h-screen">
         <div className="pb-[60px] px-4 max-xs:px-0">
            <div className="flex py-5 items-center max-md:flex-wrap max-xs:px-2">
               <Button variant="link" className="text-lg p-0 flex items-center max-md:border border-black max-md:px-3 max-md:mb-3" onClick={() => router.back()}>
                  <MoveLeft className="mr-2 max-md:m-0" />
                  <span className="max-md:hidden">Takaisin</span>
               </Button>
               <div className="mx-2 max-md:w-full max-md:block">
                  <Separator className="rotate-90 w-6 text-black border-black bg-black max-md:hidden" />
               </div>
               <Button variant="link" className={cn("underline text-lg p-0 mr-5 opacity-40 font-semibold", tab === "" && "opacity-1")} onClick={() => setTab("")}>
                  Kaikki
               </Button>
               <Button variant="link" className={cn("underline text-lg p-0 mr-5 opacity-40 font-semibold", tab === "my" && 'opacity-1')} onClick={() => setTab("my")}>
                  Minun lähetetyt
               </Button>
               <Button variant="link" className={cn("underline text-lg p-0 opacity-40 font-semibold", tab === "favorites" && 'opacity-1')} onClick={() => setTab("favorites")}>
                  Minun suosikit
               </Button>
            </div>

            {/* {hasNewPosts && (
               <div className="w-full">
                  <Button onClick={async () => await mutate()}>Uudet kuvat ovat tulleet, haluatko ladata?</Button>
               </div>
            )} */}

            {isLoading
               ? (
                  <>
                     <div className="mt-2 bg-white p-4 py-10">
                        <Skeleton className="w-[30%] h-[20px] rounded-lg" />
                        <Skeleton className="w-[10%] h-[20px] my-2 rounded-lg" />
                        <Skeleton className="w-full max-w-[360px] mx-auto h-[450px] rounded-lg" />
                     </div>
                     <div className="mt-4 bg-white p-4 py-10">
                        <Skeleton className="w-[30%] h-[20px] rounded-lg" />
                        <Skeleton className="w-[10%] h-[20px] my-2 rounded-lg" />
                        <Skeleton className="w-full max-w-[360px] mx-auto h-[450px] rounded-lg" />
                     </div>
                  </>
               ) : <PostList
                  posts={filteredList}
                  favoritesList={favoritesList}
                  user={userData}
                  isLoading={isLoading}
                  isValidating={isValidating}
                  addToFavorites={addToFavorites}
                  mutate={mutate}
               />
            }
         </div>
         <div className="fixed bottom-0 right-1/2 -translate-x-1/2 -mr-[88px]">
            <UploadImage mutate={mutate} user_id={userData.id} event_id={eventData.id} />
         </div>
      </div>
   );
}

