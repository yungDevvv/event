"use client"
import '../../custom.css'

import { useOrigin } from '@/hooks/use-origin';
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import useSWR from "swr";
import { useEffect } from 'react';
import { Menu } from 'lucide-react';

import {
   Menubar,
   MenubarContent,
   MenubarItem,
   MenubarMenu,
   MenubarSeparator,
   MenubarShortcut,
   MenubarTrigger,
} from "@/components/ui/menubar"


export default function Page({ params }) {
   const { invintation_id } = params;

   const router = useRouter();
   const origin = useOrigin();
   const supabase = createClient();

   const logOut = async () => {

      const { error } = await supabase.auth.signOut()
      router.push(origin + "/register-for-event/" + invintation_id + "/?login=true");

   }

   const { data: event } = useSWR(invintation_id + "m", async () => {
      const { data, error } = await supabase
         .from("events")
         .select("*")
         .eq("invintation_id", invintation_id);

      if (error) {
         console.error(error);
         return;
      }
      console.log(data)
      return data.length !== 0 ? data : null;
   });

   return (
      <div className='bg-black text-white min-h-screen h-full'>
         {/* {console.log(event[0].instructions_file)} */}
         {/* {event && event[0]?.instructions_file && (
            <iframe
               src={`https://supa.crossmedia.fi/storage/v1/object/public/client_data/7862b87f-7218-4cae-a3bd-e6a8acc741aa/instructions/DrQiN`}
               style={{ width: '100%', height: '600px' }}
               frameBorder="0"
            />
         )} */}

         {/* <div className="page-header-image-monkija"></div>
         <Button variant="link">
            <Link href={`/event/${invintation_id}/feed`} className='text-lg'>Kuvasyöte</Link>
         </Button> */}
         {/* <Button variant="link">
            <Link href={"/logout?event_invite_id=" + invintation_id} className='text-lg'>Kirjaudu ulos</Link>
         </Button> */}
         {/* <Button variant="" className="text-lg" onClick={() => logOut()}>
            Kirjaudu ulos
         </Button>
         <Button className="mt-5">
            <Link href={"https://g.page/r/CXOHqSFUTPxuEAE/review"} className='text-lg font-normal'>Arvostele meitä Googlessa</Link>
         </Button> */}

         <section className='page-header-image-monkija relative'>
            <div className="absolute inset-0 bg-black/50"></div>
            <div className='relative z-10 top-[20%]'>
               <div className='flex justify-center w-full'>
                  <img src="/Poistielta-Logo.svg" className='w-40 text-center' alt="Logo" />
               </div>
               <h1 className='text-center font-semibold text-3xl mb-5'>Tervetuloa tapahtumaan!</h1>
               <p className='text-center text-xl text-orange-600'>Motocross Rider</p>
            </div>
         </section>
         <section className="space-y-3 py-5 px-2">
            <Button className="w-full py-6 bg-orange-600">
               <Link href={`/event/${invintation_id}/feed`} className='text-lg'>Näytä tunnelmat</Link>
            </Button>
            <Button className="w-full py-6 bg-orange-600">
               <Link href={"https://g.page/r/CXOHqSFUTPxuEAE/review"} className='text-lg'>Arvostele meitä Googlessa</Link>
            </Button>
            <Button className="w-full text-lg py-6 bg-orange-600" onClick={() => logOut()}>
               Kirjaudu ulos
            </Button>
         </section>
         <section>
            <Link className='text-white text-lg block mb-5 ' href={`https://supa.crossmedia.fi/storage/v1/object/public/client_data/7862b87f-7218-4cae-a3bd-e6a8acc741aa/instructions/DrQiN`}>Tässä on ohjeistus</Link>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis nulla ex aperiam aliquam officia voluptatem? Pariatur, minus doloremque quae inventore omnis delectus temporibus cupiditate odit tempore, ipsam repellendus deleniti vero.
         </section>
      </div>
   );
}

