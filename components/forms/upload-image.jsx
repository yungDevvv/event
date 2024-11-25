"use client"

import { useState } from "react";
import { Button } from "../ui/button";
import { createClient } from "@/lib/supabase/client";
import { Camera, Loader2, X } from "lucide-react";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

export default function UploadImage({ user_id, event_id, mutate }) {
   const [image, setImage] = useState(null);
   const [loading, setLoading] = useState(false);
   const [previewUrl, setPreviewUrl] = useState(null);
   const t = useTranslations();
   const router = useRouter();
   const { toast } = useToast(); 

   const handleImageChange = (e) => {
      const selectedFile = e.target.files[0];
      
      if (selectedFile) {
         const maxSizeInBytes = 50 * 1024 * 1024; // 100 MB
  
          if (selectedFile.size > maxSizeInBytes) {
              toast({
                  variant: "destructive",
                  title: "Virhe: Kuvan koko ei saa olla suurempi kuin 100 MB!",
              });
              return;
          }
  
          setImage(selectedFile);
          setPreviewUrl(URL.createObjectURL(selectedFile));
      }
  };

   const uploadImage = async () => {
      const supabase = createClient();

      try {
         setLoading(true);
         if (!image) return;

         const fileName = `private/${event_id}/${Date.now()}_/_${event_id}`; // eventID/userID.png

         const { data, error } = await supabase.storage
            .from('event_images')
            .upload(fileName, image);

         if (error) {
            throw error;
         }

         const { error: insertError } = await supabase
            .from('event_posts')
            .insert({ user_id: user_id, event_id: event_id, image_url: data.fullPath });

         if (insertError) {
            throw insertError;

         }

         mutate(); // Update cache

         toast({
            variant: "success",
            title: "Onnistui!",
            description: "Kuva on lähetetty onnistuneesti!"
         });
      
      } catch (error) {
         console.error('Error uploading image:', error.message);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe kuvan latauksessa."
         });
      } finally {
         router.refresh();
         setLoading(false);
         setImage(null);
         setPreviewUrl(null);
      }
   };

   return (
      <>
         <Button variant="outline" size={"icon"} className="cursor-pointer" asChild>
            <label htmlFor="dropzone-file" className="w-full h-auto border-none cursor-pointer flex justify-center items-center bg-transparent hover:bg-transparent">
               <div className="border-4 border-clientprimary rounded-full p-4 bg-orange-100 bg-opacity-20 backdrop-blur-sm">
                  <Camera size={48} className="text-clientprimary" />
               </div>
               <input id="dropzone-file" type="file" className="hidden" accept="image/*, video/*" onChange={handleImageChange} />
            </label>
         </Button>
         <AlertDialog open={image ? true : false}>
            <AlertDialogContent>
               <AlertDialogHeader className="relative flex flex-row items-center justify-between">
                  <AlertDialogTitle>Lähetä kuva</AlertDialogTitle>
                  <AlertDialogDescription></AlertDialogDescription>
                  <button onClick={() => {
                     setImage(null);
                     setPreviewUrl(null);
                  }}
                     variant="outline"
                     className=" !p-0 !m-0"
                  >
                     <X />
                  </button>
               </AlertDialogHeader>
               <div className="my-1 w-full h-full max-h-[450px] aspect-[3/4]">
                  {previewUrl && <img src={previewUrl} className="rounded-xl w-full h-full object-contain" />}
               </div>
               <AlertDialogFooter>
                  <AlertDialogAction variant={"outline"} className="text-md" onClick={() => uploadImage()}>
                     {loading ? <Loader2 className="animate-spin" /> : t("m1")}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   )
}

