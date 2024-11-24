"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2, Search, SquareX, X } from "lucide-react";
import { useRouter } from "next/navigation"
import { Fragment, useEffect, useState } from "react";
import useSWR from "swr";

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns";

export default function Page({ params }) {
   const supabase = createClient();
   const { event_id } = params;

   const [isFullScreen, setIsFullScreen] = useState(false);
   const [fullscreenImage, setFullscreenImage] = useState({});
   let [filter, setFilter] = useState("waiting");

   const toggleFullScreen = (imageUrl, type) => {
      setIsFullScreen(!isFullScreen);
      setFullscreenImage({
         imageUrl,
         type
      })
   };

   const { toast } = useToast();
   const router = useRouter()

   const { data: reportedPosts, mutate, isLoading } = useSWR(event_id, async () => {
      const { data, error } = await supabase
         .from("event_posts")
         .select("id, image_url, is_accepted, report_status, events!event_id(event_name), users!user_id(first_name,  last_name, email)")
         .eq("event_id", event_id)
         .eq("is_reported", true)

      if (error) {
         console.error(error);
         return;
      }
      if (data) {
         return data.length !== 0 ? data : null;
      }

      return null;
   });

   const filteredReportedPosts = (reportedPosts || []).filter(post => {
      if (filter === "all") return true;
      return post.report_status === filter;
   });

   useEffect(() => {
      console.log(filteredReportedPosts)
      console.log(filter)
   }, [filter])
   return (
      <div className="w-full h-full">
         <h1 className="font-semibold text-2xl">{reportedPosts && reportedPosts.length !== 0 && reportedPosts[0].events.event_name}</h1>
         <div className="space-x-4 mt-5">
            <Button className={cn("bg-clientprimary hover:bg-clientprimaryhover opacity-90", filter === "waiting" && "bg-clientprimaryhover opacity-1")} onClick={() => setFilter("waiting")}>Odottaa hyväksyntä</Button>
            <Button className={cn("bg-clientprimary hover:bg-clientprimaryhover opacity-90", filter === "deleted" && "bg-clientprimaryhover opacity-1")} onClick={() => setFilter("deleted")}>Poistetut</Button>
            <Button className={cn("bg-clientprimary hover:bg-clientprimaryhover opacity-90", filter === "approved" && "bg-clientprimaryhover opacity-1")} onClick={() => setFilter("approved")}>Hyväksytyt</Button>
            <Button className={cn("bg-clientprimary hover:bg-clientprimaryhover opacity-90", filter === "all" && "bg-clientprimaryhover opacity-1")} onClick={() => setFilter("all")}>Kaikki</Button>
         </div>
         {isFullScreen && (
            <div
               className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
               onClick={toggleFullScreen}
            >
               {fullscreenImage.type === "video" && <video autoPlay muted loop controls className="rounded-xl py-10 w-full h-full object-contain" src={fullscreenImage.imageUrl} />}
               {fullscreenImage.type === "image" && <img className="rounded-xl w-full h-full py-10 object-contain" src={fullscreenImage.imageUrl} />}
            </div>
         )}
         {isLoading
            ? (
               <div className="w-full h-full flex items-center justify-center">
                  <Loader2 size={46} className="text-zinc-700 animate-spin" />
               </div>
            ) : filteredReportedPosts && filteredReportedPosts.map(post => <ReportedPost supabase={supabase} router={router} toast={toast} mutateParent={mutate} toggleFullScreen={toggleFullScreen} key={post.id} post={post} />)
         }
      </div>
   );
}


const ReportedPost = ({ supabase, post, toggleFullScreen, router, toast, mutateParent }) => {
   const [fileType, setFileType] = useState(null)

   const { data: reportedPostData, mutate, isLoading } = useSWR(post.id, async () => {
      const { data, error } = await supabase
         .from("event_posts_reports")
         .select("report_reason, created_at, users!user_id(first_name, last_name, email)")
         .eq("event_post_id", post.id)

      console.log(data)
      if (error) {
         console.error(error);
         return;
      }
      if (data) {
         return data.length !== 0 ? data : [];
      }

      return [];
   });


   const deleteImageFromView = async () => {
      const supabase = createClient();

      const { error } = await supabase
         .from("event_posts")
         .update({ is_accepted: false })
         .eq("id", post.id)

      const { error: updateStatusError } = await supabase
         .from("event_posts")
         .update({
            report_status: "deleted",
            is_accepted: false
         })
         .eq("id", post.id)

      if (error) {
         console.error(error);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe poistaessa kuva."
         });
         return;
      }
      if (updateStatusError) {
         console.error(updateStatusError);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe poistaessa kuva."
         });
         return;
      }

      toast({
         variant: "success",
         title: "Kuva",
         description: "Kuva on poistettu näkymästä onnistuneesti!"
      });

      router.refresh();
      mutateParent();

   }

   const approveImage = async () => {
      const supabase = createClient();

      const { error: eventPostError } = await supabase
         .from("event_posts")
         .update({ is_accepted: true, report_status: "approved" })
         .eq("id", post.id)

      if (eventPostError) {
         console.error(eventPostError);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe."
         });
         return;
      }

      toast({
         variant: "success",
         title: "Kuva",
         description: "Kuva on säilytetty!"
      });

      router.refresh();
      mutateParent();
   }

   useEffect(() => {
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

      getMimeTypeFromUrl("https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url);
   }, [post]);

   return (
      <Fragment>
         <div className="w-full flex my-5">
            <div className="max-w-[200px] max-h-[200px] my-3 relative">
               <Search size={30} onClick={() => toggleFullScreen("https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url, fileType)} className="absolute top-3 right-3 text-clientprimary cursor-pointer" />
               {fileType === "video" && <video autoPlay muted loop controls className="rounded-xl w-full h-full object-cover" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url} />}
               {fileType === "image" && <img className=" rounded-xl w-full h-full object-cover" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url} />}
            </div>

            <div className="my-auto ml-10">
               <div className="mb-5">
                  {post.report_status === "deleted" && <Badge variant="destructive">Poistettu</Badge>}
                  {post.report_status === "waiting" && <Badge className="bg-blue-500 hover:bg-blue-500">Odottaa hyväksyntä</Badge>}
                  {post.report_status === "approved" && <Badge className="bg-green-500 hover:bg-green-500">Hyväksytty</Badge>}
               </div>
               <p className="text-xs text-zinc-700">Kuvan omistaja</p>
               <h3>{post.users.email}</h3>
               <p className="text-zinc-700 -mt-1 text-sm">{post.users.first_name} {post.users.last_name}</p>
               <hr className="my-2" />
               <Dialog>
                  <DialogTrigger>Katso raportit</DialogTrigger>
                  <DialogContent>
                     <DialogHeader>
                        <DialogTitle>Kaikki kuvan raportit</DialogTitle>
                        <DialogDescription>

                        </DialogDescription>
                        <div>
                           {reportedPostData && reportedPostData.length !== 0 && reportedPostData.map((reason) => {
                              return (
                                 <div key={reason.created_at} className='my-2'>
                                    <div className='flex items-center justify-between'>
                                       <p className='font-semibold'>{reason.users.first_name} {reason.users.last_name}</p>
                                       <p className='text-zinc-400'>{format(new Date(reason.created_at), 'HH:mm')}</p>
                                    </div>
                                    <p className="text-red-500 text-sm">{reason.report_reason}</p>
                                 </div>
                              )
                           })}
                        </div>
                     </DialogHeader>
                  </DialogContent>
               </Dialog>
            </div>
            <div className="my-auto ml-auto">
               {post.report_status === "deleted" && (
                  <Button className="bg-clientprimary hover:bg-clientprimaryhover" onClick={() => approveImage()}>Hyväksy</Button>
               )}
               {post.report_status === "approved" && (
                  <Button className="bg-red-600 hover:bg-red-700 block" onClick={() => deleteImageFromView()}>Poista näkyvistä</Button>
               )}
               {post.report_status === "waiting" && (
                  <Fragment>
                     <Button className="bg-green-600 hover:bg-green-700 block mb-3" onClick={() => approveImage()}>Hyväksy</Button>
                     <Button className="bg-red-600 hover:bg-red-700 block" onClick={() => deleteImageFromView()}>Poista näkyvistä</Button>
                  </Fragment>
               )}
            </div>

            <div className="my-auto ml-auto">

            </div>


         </div>
         <hr />
      </Fragment>

   )
}