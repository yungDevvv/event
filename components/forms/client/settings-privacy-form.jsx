"use client";

import { useState } from 'react';
import { Button } from '../../ui/button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const SettingsPrivacyForm = ({ recordExists, user, privacy }) => {
   const [pdfUrl, setPdfUrl] = useState(null);
   const [rawSelectedFile, setRawSelectedFile] = useState(null);
   const [selectedOption, setSelectedOption] = useState(privacy !== null ? privacy.active_privacy : "link");
   const [inputValue, setInputValue] = useState(privacy?.link_privacy ? privacy.link_privacy : "");

   const { toast } = useToast();

   const supabase = createClient();
   const router = useRouter();

   const handleFileChanges = (event) => {
      const file = event.target.files[0];

      if (file) {
         setRawSelectedFile(file);
         console.log(file)
         const url = URL.createObjectURL(file);
         console.log(url)
         setPdfUrl(url);
      }
   };

   const handleSubmitPDF = async () => {
      if (privacy !== null && selectedOption === "pdf" && privacy.pdf_privacy && !pdfUrl) {
         const { error } = await supabase
            .from('client_data')
            .update({
               user_id: user.id,
               privacy: {
                  active_privacy: selectedOption,
                  pdf_privacy: privacy?.pdf_privacy ? privacy.pdf_privacy : '',
                  link_privacy: privacy?.link_privacy ? privacy.link_privacy : ''
               }
            })
            .eq("user_id", user.id)

         if (error) {
            console.error(error);
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tietosuojaselosten latauksessa tietokantaan.",
            });
            return;
         }

         toast({
            variant: "success",
            title: "Tietosuojaseloste",
            description: "Nyt käytät PDF-muotoisen tietosuojaselosten."
         });

         router.refresh();
         return;
      }

      const fileName = `${user.id}/privacy/${generateId()}`;

      const { data: uploadedFile, error: uploadedFileError } = await supabase.storage
         .from('client_data')
         .upload(fileName, rawSelectedFile);

      if (uploadedFileError) {
         console.error(uploadedFileError);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe pdf:n latauksessa varastoon.",
         });
         return;
      }

      if (recordExists === false) { // no record in db
         const { error: insertError } = await supabase
            .from('client_data')
            .insert({
               user_id: user.id,
               privacy: {
                  active_privacy: selectedOption,
                  pdf_privacy: uploadedFile.fullPath,
                  link_privacy: inputValue
               }
            })

         if (insertError) {
            console.error(insertError);
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe pdf:n latauksessa tietokantaan.",
            });
            return;
         }

         toast({
            variant: "success",
            title: "Onnistui!",
            description: "Tietosuojaseloste on päivitetty onnistuneesti."
         });
      } else { // record exists
         const { error: insertError } = await supabase
            .from('client_data')
            .update({
               privacy: {
                  active_privacy: selectedOption,
                  pdf_privacy: uploadedFile.fullPath,
                  link_privacy: privacy?.link_privacy ? privacy.link_privacy : ''
               }
            })
            .eq("user_id", user.id)

         if (insertError) {
            console.error(insertError);
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tietosuojaselosten latauksessa tietokantaan.",
            });
            return;
         }

         toast({
            variant: "success",
            title: "Onnistui!",
            description: "Tietosuojaseloste on päivitetty onnistuneesti."
         });
      }

      router.refresh();
   }

   const handleSubmitLink = async () => {
      
      if (privacy !== null && selectedOption === "link" && privacy.link_privacy === inputValue) {
         const { error } = await supabase
            .from('client_data')
            .update({
               user_id: user.id,
               privacy: {
                  active_privacy: selectedOption,
                  pdf_privacy: privacy?.pdf_privacy ? privacy.pdf_privacy : '',
                  link_privacy: privacy?.link_privacy ? privacy.link_privacy : ''
               }
            })
            .eq("user_id", user.id)

         if (error) {
            console.error(error);
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tietosuojaselosten latauksessa tietokantaan.",
            });
            return;
         }

         toast({
            variant: "success",
            title: "Tietosuojaseloste",
            description: "Nyt käytät LINKKI-muotoisen tietosuojaselosten."
         });

         router.refresh();
         return;
      }

      if (recordExists === false) {
         const { error } = await supabase
            .from("client_data")
            .insert({
               user_id: user.id,
               privacy: {
                  active_privacy: selectedOption,
                  link_privacy: inputValue,
                  pdf_privacy: privacy?.pdf_privacy ? privacy?.pdf_privacy : ''
               }
            })

         if (error) {
            console.error(error);
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tietosuojaselosten tallentamisessa."
            })
            return;
         }

         toast({
            variant: "success",
            title: "Onnistui!",
            description: "Tietosuojaselosten tallentaminen onnistui."
         })
      } else {
         const { error } = await supabase
            .from("client_data")
            .update({
               privacy: {
                  active_privacy: selectedOption,
                  link_privacy: inputValue,
                  pdf_privacy: privacy?.pdf_privacy ? privacy?.pdf_privacy : ''
               }
            })
            .eq("user_id", user.id)

         if (error) {
            console.error(error);
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tietosuojaselosten päivittämisessa."
            })
            return;
         }

         toast({
            variant: "success",
            title: "Onnistui!",
            description: "Tietosuojaselosten päivittäminen onnistui."
         })
      }

      router.refresh();
   }
   return (
      <div className='w-full flex items-center'>
         <div className='w-full max-w-[40%] mr-5'>
            <h1 className='font-semibold' onClick={() => console.log(pdfUrl)}>Tietosuojaseloste</h1>
            <p className='text-zinc-600 leading-tight'>Voit lähettää PDF-tiedoston tai laittaa linkki.</p>
         </div>
         <div className="w-full max-w-[60%] flex items-center justify-between">
            <RadioGroup onValueChange={(value) => setSelectedOption(value)} defaultValue={selectedOption}>
               <div className="flex items-center space-x-2">
                  <RadioGroupItem value="link" id="link" />
                  <Label htmlFor="link" className="font-normal">Käytä linkkiä</Label>
               </div>
               <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="font-normal">Käytä pdf</Label>
               </div>
            </RadioGroup>
            <div className="flex flex-col max-w-[200px] w-full">
               {selectedOption === "link" &&
                  <Input
                     type="text"
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     className="bg-white w-full mb-1"
                  />
               }
               {selectedOption === "pdf" && (
                  <Button className="w-full mb-1">
                     <label
                        htmlFor="pdf-upload"
                        className="cursor-pointer w-full h-full"
                     >
                        Lataa pdf
                     </label>
                     <input
                        type="file"
                        id="pdf-upload"
                        accept='*'
                        onChange={handleFileChanges}
                        className="hidden"
                     />
                  </Button>
               )}
               {pdfUrl && selectedOption === "pdf" && (
                  // <iframe src={pdfUrl} width="100%" height="200px" />
                  <Link className='underline my-1 text-sm' href={pdfUrl}>Uusi ladattu tietosuojaseloste</Link>
               )}
               {privacy !== null && !pdfUrl && selectedOption === "pdf" &&
                  <Link className='underline my-1 text-sm' href={"https://supa.crossmedia.fi/storage/v1/object/public/" + privacy.privacy}>Ladattu tietosuojaseloste</Link>
               }
               {/* {!privacy?.pdf_privacy && selectedOption === "pdf" && pdfUrl &&
                  <Button
                     onClick={handleSubmitPDF}
                     className="w-full bg-orange-400 hover:bg-orange-500 mt-2"
                  >
                     Käytä pdf ja tallenna
                  </Button>
               }
               {privacy?.pdf_privacy || selectedOption === "link" && (
                  <Button
                     onClick={selectedOption === "pdf" ? handleSubmitPDF : handleSubmitLink}
                     className="w-full bg-orange-400 hover:bg-orange-500 mt-2"
                  >
                     Käytä {selectedOption === "link" ? "linkkiä" : selectedOption} {(pdfUrl && selectedOption === "pdf") || (inputValue !== privacy?.link_privacy && selectedOption === "link") && "ja talenna"}
                  </Button>)
               } */}
               {selectedOption === "pdf" && (privacy?.pdf_privacy || pdfUrl) && (
                  <Button
                     onClick={handleSubmitPDF}
                     className="w-full bg-orange-400 hover:bg-orange-500 mt-1"
                  >
                     {pdfUrl && selectedOption === "pdf"
                        ? "Käytä pdf ja tallenna"
                        : "Käytä pdf"
                     } 
                  </Button>
               )}
               {selectedOption === "link" && inputValue && (
                  <Button
                     onClick={handleSubmitLink}
                     className="w-full bg-orange-400 hover:bg-orange-500 mt-1"
                  >
                     {inputValue !== privacy?.link_privacy && selectedOption === "link"
                        ? "Käytä linkkiä ja tallenna"
                        : "Käytä linkkiä"
                     } 
                  </Button>
               )}
            </div>
         </div>
      </div>
   );
}

export default SettingsPrivacyForm;