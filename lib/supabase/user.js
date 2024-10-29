import { createClient } from "./server";


export default async function getAuthUser() {
   const supabase = createClient();
   const { data, error: authError } = await supabase.auth.getUser();

   console.log(data)
   if (authError || !data?.user) {
      console.error(error);
      return;
   }

   if(data && !data.user) {
      return redirect('/login')
   }

   const {data: user, error} = await supabase.from("users").select("*").eq("id", data.user.id).single();

   if (error || !user) {
      console.error(error);
      return;
   }

   if(data && !data.user) {
      return redirect('/login')
   }

   return user;
}