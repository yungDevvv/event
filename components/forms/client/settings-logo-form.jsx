"use client";

import { useState } from 'react';
import { Button } from '../../ui/button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { generateId } from '@/lib/utils';

const SettingsLogoForm = ({ recordExists, user, logo }) => {
   const [selectedFile, setSelectedFile] = useState(null);
   const [rawSelectedFile, setRawSelectedFile] = useState(null);

   const { toast } = useToast();

   const supabase = createClient();
   const router = useRouter();

   const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
         setRawSelectedFile(file);

         const reader = new FileReader();
         reader.onloadend = () => {
            setSelectedFile(reader.result);
         };
         reader.readAsDataURL(file);
      }
   };

   const handleSubmit = async () => {
      const fileName = `${user.id}/logo/${generateId()}`;

      const { data: uploadedFile, error: uploadedFileError } = await supabase.storage
         .from('client_data')
         .upload(fileName, rawSelectedFile);

      if (uploadedFileError) {
         console.error(uploadedFileError);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe logon latauksessa varastoon.",
         });
         return;
      }

      if (recordExists === false) { // no record in db
         const { error: insertError } = await supabase
            .from('client_data')
            .insert({
               user_id: user.id,
               logo: uploadedFile.fullPath
            })

         if (insertError) {
            console.error(insertError);
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe logon latauksessa tietokantaan.",
            });
            return;
         }

         toast({
            variant: "success",
            title: "Logo",
            description: "Logo on tallennettu onnistuneesti."
         });
      } else { // record exists
         const { error: insertError } = await supabase
            .from('client_data')
            .update({
               logo: uploadedFile.fullPath
            })
            .eq("user_id", user.id)

         if (insertError) {
            console.error(insertError);
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe logon latauksessa tietokantaan.",
            });
            return;
         }

         toast({
            variant: "success",
            title: "Logo",
            description: "Logo on päivitetty onnistuneesti."
         });
      }

      router.refresh();
   }

   return (
      <div className='flex'>
         <div>
            <h1 className='font-semibold'>Yrityksen logo</h1>
            <p className='text-zinc-600 leading-tight'>Lataa oma yrityksesi logo.</p>
            <div className='mt-4'>
               <Button className="mr-2 mt-auto">
                  <label
                     htmlFor="logo-upload"
                     className="cursor-pointer w-full h-full"
                  >
                     {rawSelectedFile ? <span className='italic'>{rawSelectedFile.name}</span> : <span>Lataa logo</span>}
                  </label>
                  <input
                     type="file"
                     id="logo-upload"
                     onChange={handleFileChange}
                     accept="image/*"
                     className="hidden" // Hides the file input
                  />
               </Button>
               {selectedFile && (
                  <Button
                     onClick={handleSubmit}
                     className="bg-orange-400 hover:bg-orange-500 mt-4"
                  >
                     Tallenna
                  </Button>
               )}
            </div>
         </div>
         <div className='max-w-[150px] w-full relative ml-10'>
            {selectedFile && <X onClick={() => {
               setSelectedFile(null);
               setRawSelectedFile(null);
            }} size={18} className="absolute -top-2 -right-2 cursor-pointer" />}
            {selectedFile && <img src={selectedFile} alt="company_logo" />}
            {logo !== null && selectedFile === null && <img src={"https://supa.crossmedia.fi/storage/v1/object/public/" + logo} alt="company_logo" />}
         </div>
      </div>
   );
}

export default SettingsLogoForm;