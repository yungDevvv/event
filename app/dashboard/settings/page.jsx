import SettingsDescriptionForm from "@/components/forms/client/settings-description-form";
import SettingsGoogleForm from "@/components/forms/client/settings-google-form";
import SettingsLogoForm from "@/components/forms/client/settings-logo-form";
import SettingsOtherForm from "@/components/forms/client/settings-other-form";
import SettingsPrivacyForm from "@/components/forms/client/settings-privacy-form";
import { createClient } from "@/lib/supabase/server";
import getAuthUser from "@/lib/supabase/user";

export default async function Page() {
   const user = await getAuthUser();
   const supabase = createClient();
  
   const { data: clientData, error: clientDataError } = await supabase
      .from("client_data")
      .select("*")
      .eq("user_id", user.id)

   if (clientDataError) {
      console.error(clientDataError);
      return (
         <div>500 INTERNAL SERVER ERROR</div>
      )
   }

   console.log(clientData)
   return (
      <div>
         <section className="my-6">
            <SettingsLogoForm
               user={user}
               recordExists={clientData.length !== 0}
               logo={clientData.length !== 0 && clientData[0].logo ? clientData[0].logo : null}
            />
         </section>
         <hr></hr>
         <section className="my-6">
            <SettingsDescriptionForm
               user={user}
               recordExists={clientData.length !== 0}
               welcome_text={clientData.length !== 0 && clientData[0].welcome_text ? clientData[0].welcome_text : null}
            />
         </section>
         <hr></hr>
         <section className="my-6">
            <SettingsOtherForm
               user={user}
               recordExists={clientData.length !== 0}
               sub_description={clientData.length !== 0 && clientData[0].sub_description ? clientData[0].sub_description : null}
            />
         </section>
         <hr></hr>
         <section className="my-6">
            <SettingsGoogleForm
               user={user}
               recordExists={clientData.length !== 0}
               google_link={clientData.length !== 0 && clientData[0].google_link ? clientData[0].google_link : null}
            />
         </section>
         <hr></hr>
         <section className="my-6">
            <SettingsPrivacyForm
               user={user}
               recordExists={clientData.length !== 0}
               privacy={clientData.length !== 0 && clientData[0].privacy ? clientData[0].privacy : null}
            />
         </section>

      </div>
   );
}


