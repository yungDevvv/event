"use client";

import { useState } from 'react';
import { Button } from '../../ui/button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const SettingsGoogleForm = ({ recordExists, user, google_link }) => {
   const [inputValue, setInputValue] = useState(google_link !== null ? google_link : "");


   const { toast } = useToast();

   const supabase = createClient();
   const router = useRouter();



   const handleSubmit = async () => {
      if (recordExists === false) {
         const { error } = await supabase
            .from("client_data")
            .insert({ user_id: user.id, google_link: inputValue })

         if (error) {
            console.error(error);
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tiedon tallentamisessa."
            })
            return;
         }

         toast({
            variant: "success",
            title: "Onnistui!",
            description: "Tiedon tallentaminen onnistui."
         })
      } else {
         const { error } = await supabase
            .from("client_data")
            .update({ google_link: inputValue })
            .eq("user_id", user.id)

         if (error) {
            console.error(error);
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tiedon päivittämisessa."
            })
            return;
         }

         toast({
            variant: "success",
            title: "Onnistui!",
            description: "Tiedon päivittäminen onnistui."
         })
      }
   }

   return (
      <div className='w-full flex items-center'>
         <div className='w-full max-w-[40%] mr-5'>
            <h1 className='font-semibold'>Google arvostelu</h1>
            <p className='text-zinc-600 leading-tight'>Syöttää google arvostelu linkki.</p>
         </div>
         <div className="w-full max-w-[60%]">

            <Input
               type="text"
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               className="bg-white"
            />
            <Button
               onClick={handleSubmit}
               className="bg-orange-400 hover:bg-orange-500 mt-2"
            >
               Tallenna
            </Button>
         </div>
      </div>
   );
}

export default SettingsGoogleForm;