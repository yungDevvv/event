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
import { useTranslations } from 'next-intl';

export default function Page() {
   const { eventData, userData } = useEventContext();

   const t = useTranslations();

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
      <div className="bg-black min-h-screen">
         <div className="pb-[60px] px-4 max-xs:px-2">
            <div className="flex items-center max-xxs:flex-wrap py-5">
               <Button variant="icon" className="max-xxs:w-full max-xxs:mb-3 text-lg flex items-center max-md:border border-black bg-clientprimary px-4 h-[37px]" onClick={() => router.push("/event/" + eventData.invintation_id)}>
                  <MoveLeft className="text-white" />
               </Button>
               {/* <div className="mx-2 max-md:w-full max-md:block">
                  <Separator className="rotate-90 w-6 text-clientprimary border-clientprimary bg-clientprimary" />
               </div> */}
               <div className='ml-auto max-xxs:ml-0 max-xxs:flex max-xxs:justify-between max-xxs:w-full'>
                  <Button className={cn("bg-clientprimary max-xxs:w-full hover:bg-clientprimaryhover text-white mr-5 opacity-40 font-medium", tab === "" && "opacity-1")} onClick={() => setTab("")}>
                     {t("w2")}
                  </Button>
                  <Button className={cn("bg-clientprimary max-xxs:w-full hover:bg-clientprimaryhover text-white mr-5 opacity-40 font-medium", tab === "my" && 'opacity-1')} onClick={() => setTab("my")}>
                     {t("w3")}
                  </Button>
                  <Button className={cn("bg-clientprimary max-xxs:w-full hover:bg-clientprimaryhover text-white opacity-40 font-medium", tab === "favorites" && 'opacity-1')} onClick={() => setTab("favorites")}>
                     {t("w4")}
                  </Button>
               </div>

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
            {tab === "" && <UploadImage mutate={mutate} user_id={userData.id} event_id={eventData.id} />}
         </div>
      </div>
   );
}

