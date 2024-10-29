"use client"

import { useOrigin } from '@/hooks/use-origin';
import '../../custom.css'

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Router } from 'lucide-react';
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function Page({ params }) {
   const { invintation_id } = params;
   const router = useRouter();
   const origin = useOrigin();
   console.log(origin)
   const logOut = async () => {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut()
      router.push(origin + "/" + invintation_id + "/?login=true");
   }
   return (
      <>
         <div className="page-header-image-monkija"></div>
         <Button variant="link">
            <Link href={`/event/${invintation_id}/feed`} className='text-lg'>Kuvasyöte</Link>
         </Button>
         {/* <Button variant="link">
            <Link href={"/logout?event_invite_id=" + invintation_id} className='text-lg'>Kirjaudu ulos</Link>
         </Button> */}
         <Button variant="" className="text-lg" onClick={() => logOut()}>
            Kirjaudu ulos
         </Button>
         <Button className="mt-5">
            <Link href={"https://g.page/r/CXOHqSFUTPxuEAE/review"} className='text-lg font-normal'>Arvostele meitä Googlessa</Link>
         </Button>
      </>
   );
}


