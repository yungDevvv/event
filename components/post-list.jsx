"use client"

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
   Delete,
   Download,
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
import { Fragment, useEffect, useState } from "react"
import { useOrigin } from "@/hooks/use-origin"
import { useTranslations } from "next-intl"
import { Input } from "./ui/input"
import { Button } from "./ui/button"


export const PostList = ({ posts, favoritesList, user, isValidating, addToFavorites, mutate }) => {
   const [mutateLoading, setMutateLoading] = useState(false);

   const { toast } = useToast();
   const supabase = createClient();

   const t = useTranslations();

   const deletePost = async (postID) => {
      const { error } = await supabase
         .from('event_posts')
         .delete()
         .eq('id', postID);

      if (error) {
         console.error(error);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe poistettaessa kuvaa."
         });
         return;
      }

      mutate(); // CACHE update

      toast({
         variant: "success",
         title: t("t3"),
         description: t("t4")
      });
   }

   return (
      <div className="text-black mx-auto max-w-[500px] pt-[100px] max-mobile:pt-[140px]">

         {posts && posts.length !== 0
            ? posts.map(post => <PostCard toast={toast} deletePost={deletePost} key={post.id} addToFavorites={addToFavorites} isFavorite={favoritesList.includes(post.id)} post={post} user={user} />)
            : <span className="max-xs:ml-2 block text-white"> Ei ole kuvia, vielä</span>
         }
         {isValidating && <div className="w-full text-center"><Loader2 className="animate-spin mx-auto" /></div>}

      </div>
   )
}

function PostCard({ toast, deletePost, user, post, addToFavorites, isFavorite }) {
   const [fileType, setFileType] = useState(null);
   const [shareText, setShareText] = useState("");
   const [isFullScreen, setIsFullScreen] = useState(false);
   const [reportModalPostId, setReportModalPostId] = useState(null);
   const [openDropdownId, setOpenDropdownId] = useState(null);
   const [reportReason, setReportedReason] = useState("");

   const ORIGIN = useOrigin();
   const t = useTranslations();

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
         });

      } catch (err) {
         console.log(err)
      }
   }

   const getMimeTypeFromUrl = async (url) => {
      try {
         const response = await fetch(url, { method: 'HEAD' });
         const contentType = response.headers.get('Content-Type');

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

   const toggleFullScreen = () => {
      setIsFullScreen(!isFullScreen);
   };

   const reportPost = async (post) => {
      const supabase = createClient();

      const { error: eventPostReportError } = await supabase
         .from("event_posts_reports")
         .insert({
            user_id: user.id,
            event_post_id: post.id,
            report_reason: reportReason,
         })

      if (eventPostReportError) {
         console.error("eventPostReportError", eventPostReportError);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe."
         });
         return;
      }

      const { error: eventPostError } = await supabase
         .from("event_posts")
         .update({
            is_reported: true,
            report_status: "waiting"
         })
         .eq("id", post.id)

      if (eventPostError) {
         console.error("eventPostError", eventPostError);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe."
         });
         return;
      }

      toast({
         variant: "success",
         title: t("t1"),
         description: t("t2")
      });

      setOpenDropdownId(null);
      setReportedReason("");
   }

   useEffect(() => {
      getMimeTypeFromUrl("https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url)
   }, [post.image_url])

   return (
      <div className=" bg-white p-4 max-xs:py-2 max-xs:px-3 mb-4 flex flex-col items-center rounded-md">
         {isFullScreen && (
            <div
               className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
               onClick={toggleFullScreen}
            >
               {fileType === "video" && <video autoPlay muted loop controls className="rounded-xl w-full h-full object-contain" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url} />}
               {fileType === "image" && <img className="rounded-xl w-full h-full object-contain" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url} />}
            </div>
         )}
         <div className="w-full flex items-center justify-between">
            <div>
               <h3 className="font-semibold">{post.users.first_name} {post.users.last_name}</h3>
               <p>{format(new Date(post.created_at), 'HH:mm')}</p>
            </div>
            <DropdownMenu modal={false} open={openDropdownId === post.id} onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? post.id : null)}>
               <DropdownMenuTrigger className="hover:bg-zinc-200 rounded-md">
                  <EllipsisVertical />
               </DropdownMenuTrigger>
               <DropdownMenuContent side={"left"}>
                  {user.id === post.user_id
                     ? (<Fragment>
                        <DropdownMenuItem className="flex items-center" onClick={() => deletePost(post.id)}>
                           <Delete size={20} className="mr-2" />
                           <span>{t("r1")}</span>
                        </DropdownMenuItem>
                        <AlertDialog open={reportModalPostId === post.id} onOpenChange={(isOpen) => setReportModalPostId(isOpen ? post.id : null)}>
                           <AlertDialogTrigger className="relative hover:bg-zinc-100 cursor-default w-full select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 flex items-center">
                              <ShieldAlert size={20} className="mr-2" />
                              <span>{t("r2")}</span>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                              <AlertDialogHeader className="space-y-0">
                                 <AlertDialogTitle>{t("r5")}</AlertDialogTitle>
                                 <AlertDialogDescription>
                                    {t("r6")}
                                 </AlertDialogDescription>
                                 <div>
                                    <Input placeholder="Esim. sopimaton kuva, luvaton käyttö…" className="block my-5" type="text" value={reportReason} onChange={(e) => setReportedReason(e.target.value)} />
                                 </div>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                 <AlertDialogCancel>{t("r7")}</AlertDialogCancel>
                                 <AlertDialogAction className="bg-clientprimary hover:bg-clientprimaryhover" onClick={() => reportPost(post)}>{t("m1")}</AlertDialogAction>
                              </AlertDialogFooter>
                           </AlertDialogContent>
                        </AlertDialog>
                     </Fragment>

                     ) : (
                        <Fragment>
                           <AlertDialog open={reportModalPostId === post.id} onOpenChange={(isOpen) => setReportModalPostId(isOpen ? post.id : null)}>
                              <AlertDialogTrigger className="relative hover:bg-zinc-100 cursor-default w-full select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 flex items-center">
                                 <ShieldAlert size={20} className="mr-2" />
                                 <span>{t("r2")}</span>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                 <AlertDialogHeader className="space-y-0">
                                    <AlertDialogTitle>{t("r5")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                       {t("r6")}
                                    </AlertDialogDescription>
                                    <div>
                                       <Input placeholder="Esim. sopimaton kuva, luvaton käyttö…" className="block my-5" type="text" value={reportReason} onChange={(e) => setReportedReason(e.target.value)} />
                                    </div>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                    <AlertDialogCancel>{t("r7")}</AlertDialogCancel>
                                    <AlertDialogAction className="bg-clientprimary hover:bg-clientprimaryhover" onClick={() => reportPost(post)}>{t("m1")}</AlertDialogAction>
                                 </AlertDialogFooter>
                              </AlertDialogContent>
                           </AlertDialog>
                        </Fragment>
                     )
                  }
               </DropdownMenuContent>
            </DropdownMenu>
         </div>
         <div className="max-w-[360px] w-full h-full max-h-[480px] my-3 aspect-[3/4]">
            {fileType === "video" && <video autoPlay muted loop controls className="rounded-xl w-full h-full object-contain" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url} />}
            {fileType === "image" && <img onClick={toggleFullScreen} className="cursor-pointer rounded-xl w-full h-full object-contain" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url} />}
         </div>

         <div className="w-full flex mt-2">
            <PostCardComments user_id={user.id} event_post_id={post.id} />
            <div className={cn(
               'bg-clientprimary rounded-full flex items-center px-4 py-2 cursor-pointer',
               isFavorite && "text-red-500"
            )} onClick={() => addToFavorites(post)}>
               <Heart className={cn('max-sm:w-[22px] text-white', isFavorite && "fill-red-500 text-red-500")} />
            </div>
            <div className={cn(
               'bg-clientprimary rounded-full flex items-center px-4 py-2 cursor-pointer ml-3',
               isFavorite && "text-red-500"
            )} onClick={() => share()}>
               <Share className='max-sm:w-[22px] text-white' />
            </div>
         </div>
      </div>
   )
}


