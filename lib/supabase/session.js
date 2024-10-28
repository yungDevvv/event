import { createClient } from "./client";

export const getSessionAccessToken = async () => {
   const supabase = createClient();
   const { data, error } = await supabase.auth.getSession();

   if(error) {
      console.error(error)
      alert("ERROR getSession")
      return;
   }
   
   return data.session.access_token;
 }