"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useOrigin } from "@/hooks/use-origin";

export default function RegisterForEventForm({ logo, title, event_id, isLogin, invintation_id }) {

   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
   const [message, setMessage] = useState("");
   const [errorMessage, setErrorMessage] = useState("");
   const [activeRegisterForm, setActiveRegisterForm] = useState(isLogin ? false : true);

   const origin = useOrigin();
   const router = useRouter();

   const supabase = createClient();

   const handleRegister = async (formData) => {
      setMessage("");
      setErrorMessage("");

      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
         email: formData.email,
         password: formData.password,
         options: {
            emailRedirectTo: origin,
            data: {
               first_name: formData.first_name,
               last_name: formData.last_name,
               // phone_number: formData.phone
            }
         }
      })

      if (error && error.code === "user_already_exists") {
         setActiveRegisterForm(false);
         setMessage("Huomasimme, että sinulla on jo käyttäjätili järjestelmässämme. Kirjaudu sisään käyttäen olemassa olevaa tiliäsi, niin voimme lisätä sinut tapahtuman osallistujaksi.");
         console.error('Error sing up:', error.message);
         return;
      }

      if (error && error.code !== "user_already_exists") {
         setErrorMessage(error.message);
         console.error('Error sing up:', error.message);
         return;
      }

      if (data && data.user) {
         const { error } = await supabase.from("users").update({ active_event: invintation_id }).eq("id", data.user.id);

         if (error) {
            console.error('Error update user info:', error.message);
            setErrorMessage(error.message);
            return;
         }

         setMessage("Kutsulinkki lähetettiin sähköpostiisi, katso myös roskapostikansio.");
      }

   }

   const handleLogin = async (formData) => {
      setMessage("");
      setErrorMessage("");

      const { data, error } = await supabase.auth.signInWithPassword({
         email: formData.email,
         password: formData.password
      });

      if (error && error.message === "Invalid login credentials") {
         setErrorMessage("Virheellinen käyttäjätunnus tai salasana");
         console.error('Error logging in:', error.message);
         return;
      }

      if (error && error.message !== "Invalid login credentials") {
         setErrorMessage(error.message);
         console.error('Error logging in:', error.message);
         return;
      }

      if (data && data.user) {
         const { error } = await supabase.from("users").update({ active_event: invintation_id }).eq("id", data.user.id);

         if (error) {
            console.error('Error update user info:', error.message);
            setErrorMessage(error.message);
            return;
         }
      }
      router.push("/")
   };

   useEffect(() => {
      (async () => {
         const { data: initUser, error: initUserError } = await supabase.auth.getUser();

         // if (initUserError) console.error(initUserError);

         if (initUser.user) {
            const { data: user, error: userError } = await supabase
               .from("users")
               .select("active_event")
               .eq("id", initUser.user.id);

            if (userError) console.error(userError);

            if (user[0]) {
               router.push("/");
            }
         }
      })()
   }, [])

   return (
      <Card className="mx-auto w-full max-w-md relative">
         {logo && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
               <img className='w-40 text-center' src={"https://supa.crossmedia.fi/storage/v1/object/public/" + logo} />
            </div>
         )}
         <CardHeader>
            <CardTitle className="text-xl text-center">
               {activeRegisterForm ? "Rekiströidy tapahtumaan " : "Kirjaudu sisään tapahtumaan "} <br></br> <span className="font-medium text-orange-400">{title}</span>
            </CardTitle>
            {message && <p className="text-green-500 text-sm">{message}</p>}
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
         </CardHeader>
         <CardContent>
            <form onSubmit={activeRegisterForm ? handleSubmit(handleRegister) : handleSubmit(handleLogin)} className="grid gap-4">
               {activeRegisterForm && (
                  <Fragment>
                     <div className="grid gap-2">
                        <Label htmlFor="first_name">Etunimi</Label>
                        <Input
                           id="first_name"
                           type="text"
                           {...register("first_name", { required: "Etunimi on pakollinen" })}
                        />
                        {errors.first_name && <p className="text-red-500 text-sm -mt-1">{errors.first_name.message}</p>}
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="last_name">Sukunimi</Label>
                        <Input
                           id="last_name"
                           type="text"
                           {...register("last_name", { required: "Sukunimi on pakollinen" })}
                        />
                        {errors.last_name && <p className="text-red-500 text-sm -mt-1">{errors.last_name.message}</p>}
                     </div>
                     {/* <div className="grid gap-2">
                        <Label htmlFor="phone">Puhelin</Label>
                        <Input
                           id="phone"
                           type="tel"
                           {...register("phone", { required: "Puhelin on pakollinen" })}
                        />
                        {errors.phone && <p className="text-red-500 text-sm -mt-1">{errors.phone.message}</p>}
                     </div> */}
                  </Fragment>
               )}
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
               <div className="grid gap-2">
                  <Label htmlFor="password">Salasana</Label>
                  <Input
                     id="password"
                     type="password"
                     {...register("password", { required: "Salasana on pakollinen" })}
                  />
                  {errors.password && <p className="text-red-500 text-sm -mt-1">{errors.password.message}</p>}
               </div>
               {activeRegisterForm
                  ? (
                     <Fragment>
                        <Button
                           type="submit"
                           className="w-full text-md bg-orange-400 hover:bg-orange-500 cursor-pointer"
                           disabled={isSubmitting}
                        >
                           {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Rekiströidy"}
                        </Button>
                        <Separator />
                     </Fragment>
                  ) : (
                     <Fragment>
                        <div className="w-full text-right">
                           <Link href="/reset-password" className="text-gray-700 hover:underline underline-offset-2">Unohditko salasana?</Link>
                        </div>
                        <Button
                           type="submit"
                           className="w-full text-md bg-orange-400 hover:bg-orange-500 cursor-pointer !text-white"
                           disabled={isSubmitting}
                        >
                           {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Kirjaudu"}
                        </Button>
                        <Separator />
                     </Fragment>
                  )}
            </form>
            <div className="mt-4 text-center text-sm">
               {activeRegisterForm
                  ? (
                     <Button variant={"link"} onClick={() => setActiveRegisterForm(false)} className="font-normal hover:underline text-base">
                        Kirjaudu sisään
                     </Button>
                  )
                  : (
                     <Button variant={"link"} onClick={() => setActiveRegisterForm(true)} className="font-normal hover:underline text-base">
                        Rekiströidy
                     </Button>
                  )}
            </div>
         </CardContent>
      </Card>
   );
}
