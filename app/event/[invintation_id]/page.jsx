// "use client"
// import '../../custom.css'
// import { useTranslation } from "react-i18next";
// import { useOrigin } from '@/hooks/use-origin';
// import { Button } from "@/components/ui/button";
// import { createClient } from "@/lib/supabase/client";
// import Link from "next/link";
// import { useRouter } from 'next/navigation';
// import useSWR from "swr";
// import { useEffect, useState } from 'react';
// import { format } from 'date-fns';
// // import { useTranslation } from 'next-i18next';
// // import { useLanguage } from "@/context/LanguageContext";


// export default function Page({ params }) {
//    const { invintation_id } = params;
//    // const { t, i18n } = useTranslation();

//    // const { language } = useLanguage();
//    const [eventClientData, setEventClientData] = useState(null);
//    // const t = useTranslations();
//    const router = useRouter();
//    const origin = useOrigin();
//    const { t } = useTranslation('common');

//    const supabase = createClient();

//    const logOut = async () => {
//       const { error } = await supabase.auth.signOut()
//       router.push(origin + "/register-for-event/" + invintation_id + "/?login=true");
//    }

//    const { data: event } = useSWR(invintation_id + "m", async () => {
//       const { data, error } = await supabase
//          .from("events")
//          .select("*")
//          .eq("invintation_id", invintation_id);

//       if (error) {
//          console.error(error);
//          return;
//       }
//       console.log(data)
//       return data.length !== 0 ? data[0] : null;
//    });



//    useEffect(() => {
//       if (event) {
//          (async () => {
//             const { error, data } = await supabase
//                .from("client_data")
//                .select("*")
//                .eq("user_id", event.user_id)

//             if (error) {
//                console.error(error);
//                setEventClientData(null);
//                return;
//             }
//             console.log(data)
//             if (data.length !== 0) {
//                setEventClientData(data[0]);
//             }
//          })()
//       }

//    }, [event])
//    // const changeLanguage = (lang) => {
//    //    router.push(`/${lang}`); // Переключение между языками
//    //  };

//    // const { t, i18n } = useTranslation();

//    // useEffect(() => {
//    //   i18n.changeLanguage("fi"); // Установить язык на клиенте
//    // }, []);

//    return (
//       <div className='bg-black text-white min-h-screen h-full'>
//          <section className='page-header-image-monkija relative'>
//             <div className="absolute inset-0 bg-black/50"></div>
//             <div className='relative z-10 top-[20%]'>
//                {eventClientData && eventClientData.logo && (
//                   <div className='flex justify-center w-full'>
//                      <img src={"https://supa.crossmedia.fi/storage/v1/object/public/" + eventClientData.logo} className='w-40 text-center' alt="Logo" />
//                   </div>
//                )}

//                <h1 className='text-center font-semibold text-3xl mb-5'>{t("v1")}</h1>
//                <p className='text-center text-xl text-clientprimary'>Motocross Rider</p>
//             </div>
//          </section>
//          <section className="py-5 px-2 flex max-md:block items-center justify-center space-x-4 max-md:space-x-0 max-md:space-y-3 container mx-auto">
//             <Button className="py-6 bg-clientprimary hover:bg-clientprimary max-md:w-full">
//                <Link
//                   href={`/event/${invintation_id}/feed`}
//                   className='text-lg'
//                >
//                   {t("v2")}
//                </Link>
//             </Button>

//             <Button className="py-6 bg-clientprimary hover:bg-clientprimary max-md:w-full">
//                <Link
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   href={"https://g.page/r/CXOHqSFUTPxuEAE/review"}
//                   className='text-lg'
//                >
//                   {t("v3")}
//                </Link>
//             </Button>
//             <button onClick={() => changeLanguage("fi")}>Сменить на Финский</button>
//             <button onClick={() => changeLanguage("en")}>Сменить на Английский</button>
//             {/* <button onClick={() => changeLanguage('fi')}>Suomi</button>
//             <button onClick={() => changeLanguage('en')}>English</button> */}
//             <Button className="text-lg py-6 bg-clientprimary hover:bg-clientprimary max-md:w-full" onClick={() => logOut()}>
//                {t("v4")}
//             </Button>
//          </section>
//          <section className='container mx-auto px-3'>
//             {eventClientData && eventClientData.welcome_text && (
//                <div
//                   className='text-white'
//                   dangerouslySetInnerHTML={{ __html: eventClientData.welcome_text }}
//                />
//             )}
//          </section>
//          <section className="container mx-auto px-3 flex mt-10 text-lg">
//             <div>
//                <p>{t("v5")}</p>
//                <p>{t("v6")}</p>
//                <p>{t("v7")}</p>
//                <p>{t("v8")}</p>
//             </div>
//             <div className='ml-10'>
//                {event?.event_time && <p>{format(new Date(event.event_date), 'dd.MM.yyyy')} {event.event_time.slice(0, 5)}</p>}
//                <p>-</p>
//                {event?.instructions_file && (
//                   <p>
//                      <Link target="_blank" rel="noopener noreferrer" className='text-white text-lg block underline' href={`https://supa.crossmedia.fi/storage/v1/object/public/${event?.instructions_file}`}>Ohjeistus</Link>
//                   </p>
//                )}
//                {event?.additional_services.length && (
//                   event?.additional_services.map(service => service + " ")
//                )}
//             </div>
//          </section>
//       </div>
//    );
// }



"use client"

import '../../custom.css'
import { useOrigin } from '@/hooks/use-origin';
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import useSWR from "swr";
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/language-switcher';


export default function Page({ params }) {
   const { invintation_id } = params;
   const t = useTranslations();

   const [eventClientData, setEventClientData] = useState(null);
   const router = useRouter();
   const origin = useOrigin();


   const supabase = createClient();

   const logOut = async () => {
      const { error } = await supabase.auth.signOut()
      router.push(origin + "/register-for-event/" + invintation_id + "/?login=true");
   }

   const { data: event } = useSWR(invintation_id + "m", async () => {
      const { data, error } = await supabase
         .from("events")
         .select("*")
         .eq("invintation_id", invintation_id);

      if (error) {
         console.error(error);
         return;
      }
      console.log(data)
      return data.length !== 0 ? data[0] : null;
   });



   useEffect(() => {
      if (event) {
         (async () => {
            const { error, data } = await supabase
               .from("client_data")
               .select("*")
               .eq("user_id", event.user_id)

            if (error) {
               console.error(error);
               setEventClientData(null);
               return;
            }
            console.log(data)
            if (data.length !== 0) {
               setEventClientData(data[0]);
            }
         })()
      }

   }, [event])

   return (
      <div className='text-white  h-full'>
         <section className='relative h-[300px]'>
            <LanguageSwitcher className={"absolute top-5 right-5 z-50"} />
            <img
               src="https://crossmedia.fi/holvi/poistielta/img/banner-monkija.jpg"
               alt="Monkija Banner"
               className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50"></div>
            <div className='relative z-10 top-[20%]'>
               {eventClientData && eventClientData.logo && (
                  <div className='flex justify-center w-full'>
                     <img src={"https://supa.crossmedia.fi/storage/v1/object/public/" + eventClientData.logo} className='w-40 text-center' alt="Logo" />
                  </div>
               )}
               <h1 className='text-center font-semibold text-3xl mb-5'>{t("v1")}</h1>
               <p className='text-center text-xl text-clientprimary'>{event?.event_name}</p>
            </div>
         </section>
         <section className="max-w-[900px] py-5 px-2 flex max-md:block items-center justify-center space-x-4 max-md:space-x-0 max-md:space-y-3 container mx-auto">

            <Button className="py-6 bg-clientprimary hover:bg-clientprimary max-md:w-full">
               <Link
                  href={`/event/${invintation_id}/feed`}
                  className='text-lg'
               >
                  {t("v2")}
               </Link>
            </Button>
            {eventClientData && eventClientData?.google_link && (
               <Button className="py-6 bg-clientprimary hover:bg-clientprimary max-md:w-full">
                  <a
                     target="_blank"
                     rel="noopener noreferrer"
                     href={eventClientData && eventClientData?.google_link ? eventClientData?.google_link : ''}
                     className='text-lg'
                  >
                     {t("v3")}
                  </a>
               </Button>
            )}

            <Button className="text-lg py-6 bg-clientprimary hover:bg-clientprimary max-md:w-full" onClick={() => logOut()}>
               {t("v4")}
            </Button>
         </section>
         <section className='container mx-auto px-3 mb-5 max-w-[900px]'>
            {eventClientData && eventClientData.welcome_text && (
               <div
                  className='text-white'
                  dangerouslySetInnerHTML={{ __html: eventClientData.welcome_text }}
               />
            )}
         </section>
         <section className="container mx-auto px-3 flex my-7 text-lg max-w-[900px]">
            <div>
               <p>{t("v5")}</p>
               <p>{t("v6")}</p>
               <p>{t("v7")}</p>
               <p>{t("v8")}</p>
            </div>

            <div className='ml-10'>
               {event?.event_time && <p>{format(new Date(event.event_date), 'dd.MM.yyyy')} {event.event_time.slice(0, 5)}</p>}
               {event?.event_place && <span>{event?.event_address}, </span>}
               {event?.event_place && <span className="capitalize">{event?.event_place}</span>}
               {event?.instructions_file && (
                  <p>
                     <Link target="_blank" rel="noopener noreferrer" className='text-white text-lg block underline' href={`https://supa.crossmedia.fi/storage/v1/object/public/${event?.instructions_file}`}>Ohjeistus</Link>
                  </p>
               )}
               {event?.additional_services.length && (
                  event?.additional_services.map(service => service + " ")
               )}
            </div>
         </section>
         <section className='container mx-auto my-7 px-3 max-w-[900px]'>
            {event && event.event_description && (
               <div
                  className='text-white'
                  dangerouslySetInnerHTML={{ __html: event.event_description }}
               />
            )}
         </section>
 
         <section className='container mx-auto mt-7 px-3 max-w-[900px]'>
            {eventClientData && eventClientData.sub_description && (
               <div
                  className='text-white'
                  dangerouslySetInnerHTML={{ __html: eventClientData.sub_description }}
               />
            )}
         </section>
      </div>
   );
}

