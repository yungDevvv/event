"use client"

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover"

import {
   Delete,
   EllipsisVertical,
   Heart,
   Loader2,
   Share,
   ShieldAlert
} from "lucide-react"

import { format } from "date-fns"

import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import PostCardComments from "./post-card-comments"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useOrigin } from "@/hooks/use-origin"

export const PostList = ({ posts, favoritesList, user, isValidating, addToFavorites, mutate }) => {
   const { toast } = useToast();


   const deletePost = async (postID) => {
      const supabase = createClient();
      const { error } = await supabase.from('event_posts').delete().eq('id', postID);

      if (error) {
         console.error(error);
         toast({
            variant: "destructive",
            title: "ERROR",
            description: "Kuvan poistaminen epäonnistui."
         });
         return;
      }

      mutate(); // CACHE update

      toast({
         variant: "success",
         className: "border-green-500 font-medium",
         description: "Kuvan poistaminen onnistui."
      });
   }

   return (
      <div className="text-black">
         {posts.length !== 0
            ? posts.map(post => <PostCard toast={toast} deletePost={deletePost} key={post.id} addToFavorites={addToFavorites} isFavorite={favoritesList.includes(post.id)} post={post} user={user} />)
            : <span className="max-xs:ml-2 block"> Ei ole kuvia, vielä</span>
         }
         {isValidating && <div className="w-full text-center"><Loader2 className="animate-spin mx-auto" /></div>}
      </div>
   )
}

function PostCard({ toast, deletePost, user, post, addToFavorites, isFavorite }) {
   const [fileType, setFileType] = useState(null);
   const [shareText, setShareText] = useState("");
   const [open, setOpen] = useState(false);
   const ORIGIN = useOrigin();
   console.log(post)
   const share = async () => {
      if (!navigator.canShare) {
         toast({
            variant: "destructive",
            title: "ERROR",
            description: "Selaimesi ei tue Web Share API:ta."
         });
         return;
      }

      try {
         await navigator.share({
            title: "Tapahtuma Pois Tieltä!",
            text: shareText,
            url: `${ORIGIN}/share?event_id=${post.event_id}&image_url=${'https://supa.crossmedia.fi/storage/v1/object/public/' + post.image_url}`
            // url: "https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url,
         });

      } catch (err) {
         console.log(err)
      }
      setOpen(false)
      setShareText("")
   }
   const getMimeTypeFromUrl = async (url) => {
      try {
         const response = await fetch(url, { method: 'HEAD' });
         const contentType = response.headers.get('Content-Type');

         //   console.log(contentType)
         if (contentType.includes('image')) {
            setFileType('image');
         } else if (contentType.includes('video')) {
            setFileType('video');
         } else {
            setFileType('unknown');
         }
      } catch (error) {
         console.error('Error fetching the URL:', error);
         setFileType('unknown');
      }
   };
   
   useEffect(() => {
      getMimeTypeFromUrl("https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url)
   }, [post.image_url])

   return (
      <div className=" bg-white p-4 mb-4 flex flex-col items-center rounded-md" onClick={() => console.log(post)}>
         <div className="w-full flex items-center justify-between">
            <div>
               <h3 className="font-semibold">{post.users.first_name} {post.users.last_name}</h3>
               <p>{format(new Date(post.created_at), 'HH:mm')}</p>
            </div>
            <DropdownMenu>
               <DropdownMenuTrigger className="hover:bg-zinc-200 p-1 rounded-md">
                  <EllipsisVertical />
               </DropdownMenuTrigger>
               <DropdownMenuContent side={"left"}>
                  {user.id === post.user_id
                     ? (
                        <DropdownMenuItem className="flex items-center text-base" onClick={() => deletePost(post.id)}>
                           <Delete size={20} className="mr-2" />
                           <span>Poista</span>
                        </DropdownMenuItem>
                     ) : (
                        <DropdownMenuItem className="flex items-center">
                           <ShieldAlert size={20} className="mr-2" />
                           <span>Report</span>
                        </DropdownMenuItem>
                     )
                  }
               </DropdownMenuContent>
            </DropdownMenu>
         </div>
         <div className="max-w-[360px] w-full h-full max-h-[480px] my-3 aspect-[3/4]">
            {fileType === "video" && <video autoPlay muted loop controls className="rounded-xl w-full h-full object-contain" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url} />}
            {fileType === "image" && <img className="rounded-xl w-full h-full object-cover" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url} />}

            {/* <video autoPlay muted loop controls className="rounded-xl w-full h-full object-contain" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url} /> */}
            {/* <img className="rounded-xl w-full h-full object-cover" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url} /> */}
         </div>
         <div className="w-full flex">
            <PostCardComments user_id={user.id} event_post_id={post.id} />
            <div className={cn(
               'bg-zinc-100 rounded-full flex items-center px-4 py-2 cursor-pointer',
               isFavorite && "text-red-500"
            )} onClick={() => addToFavorites(post)}>
               <Heart className={cn('max-sm:w-[22px]', isFavorite && "fill-red-500")} />
            </div>
            <Popover modal open={open} onOpenChange={setOpen}>
               <PopoverTrigger className="bg-zinc-100 rounded-full flex items-center px-4 py-2 cursor-pointer ml-3">
                  {/* <Button className="bg-zinc-100 hover:bg-zinc-100 rounded-full flex items-center px-4 py-2 cursor-pointer ml-2" onClick={() => shareSome()}>
                  <Share className='max-sm:w-[22px] text-black' />
               </Button> */}
                  <Share className='max-sm:w-[22px] text-black' />
               </PopoverTrigger>
               <PopoverContent side="top" className="mb-3">
                  <Input value={shareText} onChange={(e) => setShareText(e.target.value)} type="text" placeholder="Kirjoita viesti..." />
                  <Button className="w-full mt-3" onClick={() => share()}>Jakaa</Button>
               </PopoverContent>
            </Popover>
            {/* <Button asChild>
               <Link href="https://api.whatsapp.com/send?text=esimerkki">Whatsapp</Link>
            </Button> */}

         </div>
      </div>
   )
}


