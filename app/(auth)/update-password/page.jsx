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
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrigin } from "@/hooks/use-origin";

export default function Page({ searchParams }) {
   // const event_invite_id = searchParams.event_invite_id;

   const origin = useOrigin();

   const router = useRouter();

   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");

   const [passwordError, setPasswordError] = useState("");
   const [confirmPasswordError, setConfirmPasswordError] = useState("");

   const [errorMessage, setErrorMessage] = useState("");
   const [isLoading, setIsLoading] = useState(false);

   const updatePassword = async (e) => {
      e.preventDefault();

      setConfirmPasswordError("");
      setPasswordError("");
      setErrorMessage("");

      if (!password) {
         setPasswordError("Salasana on pakollinen");

      }
      if (!confirmPassword) {
         setConfirmPasswordError("Salasanan vahvistus on pakollinen");
      }

      if (!password || !confirmPassword) return;

      if (password !== confirmPassword) {
         setErrorMessage("Salasanat eivät täsmää. Varmista, että olet kirjoittanut saman salasanan molempiin kenttiin.");
         return;
      }

      setIsLoading(true);

      const supabase = createClient();
      const { data, error } = await supabase.auth.updateUser({
         password
      })

      if(error) {
         setIsLoading(false);
         if (error.code === "same_password") {
            console.error(error);
            setErrorMessage("Uuden salasanan tulee olla erilainen kuin vanha salasana.");
            return;
         } else {
            console.error(error);
            setErrorMessage("Oops, tapahtui virhe!");
            return;
         }
      }
      
      if(data && data.user) {
         router.push(origin + "/login");
      }
      
      setIsLoading(false);
   }

   useEffect(() => {
      if (password) {
         setPasswordError("");
      }
      if (confirmPassword) {
         setConfirmPasswordError("");
      }
   }, [password, confirmPassword])
   return (
      <div className="flex h-screen w-full items-center justify-center px-4 bg-orange-100">
         <Card className="mx-auto w-full max-w-md">
            <CardHeader>
               <CardTitle className="text-xl">
                  Päivitä salasana
               </CardTitle>
               {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            </CardHeader>
            <CardContent>
               <form onSubmit={updatePassword} className="grid gap-4">
                  <div className="grid gap-2">
                     <Label htmlFor="email">Salasana</Label>
                     <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                     />
                     {passwordError && <p className="text-red-500 text-sm -mt-1">{passwordError}</p>}
                  </div>

                  <div className="grid gap-2">
                     <Label htmlFor="email">Vahvista salasana</Label>
                     <Input
                        id="password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                     />
                     {confirmPasswordError && <p className="text-red-500 text-sm -mt-1">{confirmPasswordError}</p>}
                  </div>

                  <Button
                     type="submit"
                     className="w-full text-md bg-orange-400 hover:bg-orange-500 cursor-pointer"
                     disabled={isLoading}
                  >
                     {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Päivitä"}
                  </Button>
               </form>
            </CardContent>
         </Card>
      </div>
   )
}

