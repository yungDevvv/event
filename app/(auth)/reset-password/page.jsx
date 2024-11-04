"use client"

import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useOrigin } from "@/hooks/use-origin";


export default function Page({ searchParams }) {
   // const event_invite_id = searchParams.event_invite_id;

   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
   const origin = useOrigin();

   const [message, setMessage] = useState("");
   const [errorMessage, setErrorMessage] = useState("");

   const resetPassword = async (formData) => {
      const supabase = createClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
         redirectTo: origin + "/update-password",
       })
       
       if(error) {
         setErrorMessage("Oops, tapahtui virhe!")
         console.error(error, "ERROR");
         return;
       }

       setMessage("Jos sähköpostiosoitteesi on oikein, saat palautuslinkin sähköpostiisi.")
       
   }
   
   return (
      <div className="flex h-screen w-full items-center justify-center px-4 bg-orange-100">
         <Card className="mx-auto w-full max-w-md">
            <CardHeader>
               <CardTitle className="text-xl">
                  Unohditko salasanan?
               </CardTitle>
               {message && <p className="text-green-500 text-sm">{message}</p>}
               {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit(resetPassword)} className="grid gap-4">

                  <div className="grid gap-2">
                     <Label htmlFor="email">Sähköposti</Label>
                     <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        {...register("email", { required: "Sähköposti on pakollinen" })}
                     />
                     {errors.email && <p className="text-red-500 text-sm -mt-1">{errors.email.message}</p>}
                  </div>
                  <Button
                     type="submit"
                     className="w-full text-md bg-orange-400 hover:bg-orange-500 cursor-pointer"
                     disabled={isSubmitting}
                  >
                     {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Lähetä"}
                  </Button>
                  <Separator />
               </form>
               <div className="mt-4 text-center text-sm">
                  <Button variant={"link"} onClick={() => setActiveRegisterForm(false)} className="underline">
                     Takaisin kirjautumiseen
                  </Button>
               </div>
            </CardContent>
         </Card>
      </div>
   )
}

