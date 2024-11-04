"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Page({ searchParams }) {
  const { code } = searchParams;

  const supabase = createClient();

  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleLogin = async (formData) => {
    setErrorMessage("");
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    });

    if (error) {
      setIsLoading(false);
      setErrorMessage(error.message);
      console.error('Error logging in:', error.message);
      return;
    }

    if (data) {
      router.push("/")
    }

    setIsLoading(false);
  };

  useEffect(() => {
    (async () => {
      const { data: initUser, error: initUserError } = await supabase.auth.getUser();

      if(initUserError) console.error(initUserError);
      
      if (initUser.user) {
        const { data: user, error: userError } = await supabase.from("users").select("active_event").eq("id", initUser.user.id);

        if(userError) console.error(userError);

        if (user[0]) {
          router.push("/");
        }
      }
    })()
  }, [code])
  return (
    <div className="flex h-screen w-full items-center justify-center px-4 bg-orange-100">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Kirjaudu sisään</CardTitle>
          <CardDescription>Onnistuneen kirjautumisen jälkeen sinut ohjataan tapahtumasivulle</CardDescription>
        </CardHeader>
        <CardContent>

          <form onSubmit={handleSubmit(handleLogin)} className="grid gap-4">
            {errorMessage && <p className="text-sm -my-2 text-red-500">{errorMessage}</p>}
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
              <div className="flex items-center">
                <Label htmlFor="password">Salasana</Label>
                {/* <Link href="#" className="ml-auto inline-block text-sm underline">
                  Unohditko salasanasi?
                </Link> */}
              </div>
              <Input
                id="password"
                type="password"
                {...register("password", { required: "Salasana on pakollinen" })}
              />
              {errors.password && <p className="text-red-500 text-sm -mt-1">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full mt-4 text-md bg-orange-400 hover:bg-orange-500 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Kirjaudu"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
