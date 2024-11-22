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
         .from("event_posts_reported")
         .select("*, event_posts!event_post_id(image_url, accepted_image), events!event_id(event_name), users!user_id(first_name, last_name, email)")
         .eq("event_id", event_id)

      if (error) {
         console.error(error);
         return;
      }
      if (data) {
         const uniqueReports = Array.from(
            data.reduce((map, report) => {
              
               if (!map.has(report.event_post_id)) {
                  map.set(report.event_post_id, {
                     ...report,
                     report_reason: [{
                        report_reason: report.report_reason,
                        first_name: report.users.first_name,
                        last_name: report.users.last_name,
                        created_at: report.created_at 
                     }]
                  });
               } else {
              
                  map.get(report.event_post_id).report_reason.push({
                     report_reason: report.report_reason,
                     first_name: report.users.first_name,
                     last_name: report.users.last_name,
                     created_at: report.created_at 
                  });
               }
               return map;
            }, new Map()).values() 
         );
         console.log(uniqueReports)
         return data.length !== 0 ? uniqueReports : null;
      }


      return null;
   });

   const filteredReportedPosts = (reportedPosts || []).filter(post => {
      // if (filter === "all") {
      //    return true;
      // } else if (filter !== "deleted") {
      //    return post.report_status === filter && post.event_posts.accepted_image === true;
      // } else {
      //    return post.report_status === filter
      // }
      if(filter === "all") return true;
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
               {fullscreenImage.type === "video" && <video autoPlay muted loop controls className="rounded-xl w-full h-full object-contain" src={fullscreenImage.imageUrl} />}
               {fullscreenImage.type === "image" && <img className="rounded-xl w-full h-full object-contain" src={fullscreenImage.imageUrl} />}
            </div>
         )}
         {isLoading
            ? (
               <div className="w-full h-full flex items-center justify-center">
                  <Loader2 size={46} className="text-zinc-700 animate-spin" />
               </div>
            ) : filteredReportedPosts && filteredReportedPosts.map(post => <ReportedPost router={router} toast={toast} mutate={mutate} toggleFullScreen={toggleFullScreen} key={post.id} post={post} />)
         }
      </div>
   );
}


const ReportedPost = ({ post, toggleFullScreen, router, toast, mutate }) => {
   const [fileType, setFileType] = useState(null)

   const deleteImageFromView = async () => {
      const supabase = createClient();

      const { error } = await supabase
         .from("event_posts")
         .update({ accepted_image: false })
         .eq("id", post.event_post_id)

      const { error: updateStatusError } = await supabase
         .from("event_posts_reported")
         .update({ report_status: "deleted" })
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
      mutate();
   }

   const approveImage = async () => {
      const supabase = createClient();

      const { error: reportedPostError } = await supabase
         .from("event_posts_reported")
         .update({ report_status: "approved" })
         .eq("id", post.id)

      const { error: eventPostError } = await supabase
         .from("event_posts")
         .update({ accepted_image: true })
         .eq("id", post.id)

      if (reportedPostError) {
         console.error(reportedPostError);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe."
         });
         return;
      }

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
      mutate();
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

      getMimeTypeFromUrl("https://supa.crossmedia.fi/storage/v1/object/public/" + post.event_posts.image_url);
   }, [post]);

   return (
      <Fragment>
         <div className="w-full flex my-5">
            <div className="max-w-[200px] max-h-[200px] my-3 relative">
               <Search size={30} onClick={() => toggleFullScreen("https://supa.crossmedia.fi/storage/v1/object/public/" + post.event_posts.image_url, fileType)} className="absolute top-3 right-3 text-clientprimary cursor-pointer" />
               {fileType === "video" && <video autoPlay muted loop controls className="rounded-xl w-full h-full object-cover" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.event_posts.image_url} />}
               {fileType === "image" && <img className=" rounded-xl w-full h-full object-cover" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.event_posts.image_url} />}
            </div>

            <div className="my-auto ml-10">
               <div className="mb-5">
                  {post.report_status === "deleted" && <Badge variant="destructive">Poistettu</Badge>}
                  {post.report_status === "waiting" && <Badge className="bg-blue-500 hover:bg-blue-500">Odottaa hyväksyntä</Badge>}
                  {post.report_status === "approved" && <Badge className="bg-green-500 hover:bg-green-500">Hyväksytty</Badge>}
               </div>

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
                           {post.report_reason.map((reason) => {
                              return (
                                 <div key={reason.created_at} className='my-2'>
                                    <div className='flex items-center justify-between'>
                                       <p className='font-semibold'>{reason.first_name} {reason.last_name}</p>
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
                  <Button className="bg-clientprimary hover:bg-clientprimaryhover" onClick={() => approveImage()}>Palauta kuva</Button>
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