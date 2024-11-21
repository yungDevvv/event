"use client";
import useSWR, { mutate } from 'swr';
import {
   Drawer,
   DrawerClose,
   DrawerContent,
   DrawerDescription,
   DrawerFooter,
   DrawerHeader,
   DrawerTitle,
   DrawerTrigger,
} from "@/components/ui/drawer"
import { MessageSquare, SendHorizonal, X } from "lucide-react"
import { Input } from "./ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client";
import { format } from 'date-fns';



export default function PostCardComments({ event_post_id, user_id }) {
   const [text, setText] = useState("");
   const supabase = createClient();
   const { data: comments, error } = useSWR(event_post_id + "m", fetchComments);

   const sendComment = async () => {
      if (!text.trim()) return;

      const { error } = await supabase.from("event_posts_comments").insert({
         event_post_id,
         user_id,
         comment_text: text
      })

      if (error) {
         console.error(error)
         alert("Oops, jotain meni väärin!");
         return;
      }
      mutate(event_post_id + "m");
      setText("");

   }

   async function fetchComments() {
      const { data, error } = await supabase
         .from("event_posts_comments")
         .select("*, users!user_id(id, first_name, last_name)")
         .eq("event_post_id", event_post_id)
         .order("created_at", { ascending: false });

      if (error) {
         console.error(error);
         return;
      }

      return data;
   };


   useEffect(() => {
      const subscription = supabase
         .channel('event_posts_comments')
         .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'event_posts_comments' }, () => {
            console.log("subscribe!")
            mutate(event_post_id + "m");
         })
         .subscribe();

      return () => {
         supabase.removeChannel(subscription);
      };
   }, [event_post_id, comments, supabase]);

   return (
      <div className='text-black'>
         <Drawer>
            <DrawerTrigger className="bg-clientprimary rounded-full flex items-center px-4 py-2 mr-3 max-sm:text-sm">
               <MessageSquare className='max-sm:w-[22px] text-white' />
               <span className="text-lg ml-2 font-semibold -mt-1 max-sm:text-base max-sm:ml-1 text-white">{comments && comments.length}</span>
            </DrawerTrigger>
            <DrawerContent>
               <DrawerHeader>
                  <DrawerTitle className="text-black text-center">Kommentit</DrawerTitle>
                  <DrawerDescription></DrawerDescription>
               </DrawerHeader>
               <ScrollArea className="min-h-[250px] max-h-[450px] border-t border-b p-4 overflow-y-scroll text-black">
                  {comments && comments.length !== 0
                     ? comments.map(comment =>
                        <div key={comment.id} className='my-2'>
                           <div className='flex items-center justify-between text-sm'>
                              <p className='font-semibold'>{comment.users.first_name} {comment.users.last_name}</p>
                              <p className='text-zinc-400'>{format(new Date(comment.created_at), 'HH:mm')}</p>
                           </div>
                           <p>
                              {comment.comment_text}
                           </p>
                        </div>)
                     : "Ei ole vielä kommenteja..."
                  }

                  {error && <p className="text-red-500 py-1">Virhe ladattaessa kommentteja</p>}
               </ScrollArea>
               <DrawerFooter>
                  <div className="flex items-center border border-zinc-200 w-full rounded-lg transition-all">
                     <Input value={text} onChange={(e) => setText(e.target.value)} required className="w-full my-1 border-0 text-lg text-black" type="text" placeholder="Kirjoita kommentti..." />
                     {text && (
                        <Button variant="icon" className="p-0 px-2 border-0 border-zinc-200" onClick={() => sendComment()}>
                           <SendHorizonal className='text-black' />
                        </Button>
                     )}
                  </div>
               </DrawerFooter>
            </DrawerContent>
         </Drawer>
      </div>

   )
}