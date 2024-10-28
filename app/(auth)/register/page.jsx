"use client"

import Link from "next/link";
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
import axios from "axios";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";


export default function Page() {
   const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();
   const [message, setMessage] = useState("");
   // const onSubmit = async (data) => {
   //    try {
   //       const res = axios.post("http://localhost:3001/api/register", {
   //          email: data.email,
   //          password: data.password
   //       })
   //       console.log(res)
   //    } catch (error) {
   //       alert(error)
   //    }
   // };
   const handleRegister = async (formData) => {
      setMessage("");

      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
         email: formData.email,
         password: formData.password,
         options: {
            data: {
               first_name: formData.first_name,
               last_name: formData.last_name,
               phone_number: formData.phone
            }
         }
      })

      if(data) {
         console.log(data)
      }
      if (error) {
         setError(error.message)
         console.error('Error sing up:', error.message);
      } else {
         setMessage("Kutsulinkki lähetettiin sähköpostiisi.")
      }
   }
   return (
      <div className="flex h-screen w-full items-center justify-center px-4 bg-orange-100">
         <Card className="mx-auto w-full max-w-sm">
            <CardHeader>
               <CardTitle className="text-2xl">Rekiströidy</CardTitle>
               {message && <p className="text-green-500 text-sm">{message}</p>}
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit(handleRegister)} className="grid gap-4">
                  {/* <div className="grid gap-2">
                     <Label htmlFor="password">Etunimi</Label>
                     <Input
                        id="password"
                        type="password"
                        {...register("password", { required: "Salasana on pakollinen" })}
                     />
                     {errors.password && <p className="text-red-500 text-sm -mt-1">{errors.password.message}</p>}
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="password">Salasana</Label>
                     <Input
                        id="password"
                        type="password"
                        {...register("password", { required: "Salasana on pakollinen" })}
                     />
                     {errors.password && <p className="text-red-500 text-sm -mt-1">{errors.password.message}</p>}
                  </div> */}
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
                     <div className="grid gap-2">
                        <Label htmlFor="phone">Puhelin</Label>
                        <Input
                           id="phone"
                           type="tel"
                           {...register("phone", { required: "Puhelin on pakollinen" })}
                        />
                        {errors.phone && <p className="text-red-500 text-sm -mt-1">{errors.phone.message}</p>}
                     </div>
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
                  <Button
                     type="submit"
                     className="w-full text-md bg-orange-400 hover:bg-orange-500 cursor-pointer"
                     disabled={isSubmitting}
                  >
                     {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Rekiströidy"}
                  </Button>
                  <Separator />
               </form>

               <div className="mt-4 text-center text-sm">
                  <Link href="/login" className="underline">
                     Kirjaudu sisään
                  </Link>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
