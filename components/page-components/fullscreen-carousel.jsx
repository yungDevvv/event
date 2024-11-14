"use client";

import {
   Carousel,
   CarouselContent,
   CarouselItem,
   CarouselNext,
   CarouselPrevious,
} from "@/components/ui/carousel";
import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const fetcher = async (event_id) => {
   const supabase = createClient();
   const { data, error } = await supabase
      .from("event_posts")
      .select("*")
      .eq("event_id", event_id)
      .eq("show", true);

   if (error) {
      throw error;
   }
   return data.length !== 0 ? data : null;
};

const FullscreenCarousel = ({ event_id }) => {
   const { data, error, isLoading, mutate } = useSWR(event_id, fetcher);
   const router = useRouter();

   useEffect(() => {
      const handleKeyDown = (event) => {
         if (event.key === 'Escape') {
            router.push(`/dashboard/events/${event_id}/diaesitys?offline=true`);
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      mutate();

      return () => {
         window.removeEventListener('keydown', handleKeyDown);
      };
   }, [router, event_id, mutate]);

   const [currentIndex, setCurrentIndex] = useState(0);
   const intervalRef = useRef(null);

   // Advance the slide every 7 seconds
   useEffect(() => {
      if (data) {
         intervalRef.current = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
         }, 7000);
      }
      return () => clearInterval(intervalRef.current);
   }, [data]);

   const toggleFullscreen = async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.error(err);
        alert("Virhe: Fullscreen-tilan vaihtaminen epäonnistui.")
      }
    };

    useEffect(() => {
  
      document.body.addEventListener("click", toggleFullscreen);
  
      return () => {
        document.body.removeEventListener("click", toggleFullscreen);
      };
    }, []);
  
   return (
      <div className="w-full h-screen bg-black">
         <Carousel loop={true} className="w-full h-full">
            <CarouselContent className="h-screen">
               {data && data.map((post, index) => (
                  <CarouselItem
                     key={index}
                     className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                  >
                     <ContentFetcher imageUrl={post.image_url} />
                     {/* <img
                        src={`https://supa.crossmedia.fi/storage/v1/object/public/${post.image_url}`}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-contain object-center"
                     /> */}
                  </CarouselItem>
               ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
         </Carousel>
      </div>
   );
};

const ContentFetcher = ({ imageUrl }) => {
   const [fileType, setFileType] = useState('unknown');

   useEffect(() => {
      const getMimeTypeFromUrl = async (url) => {
         try {
            const response = await fetch(url, { method: 'HEAD' });
            const contentType = response.headers.get('Content-Type');

            if (contentType.includes('image')) {
               setFileType('image');
            } else if (contentType.includes('video')) {
               setFileType('video');
            } else {
               setFileType('unknown');
            }
         } catch (error) {
            console.error('Error fetching the URL:', error);
            setFileType('unknown');
         }
      };

      getMimeTypeFromUrl("https://supa.crossmedia.fi/storage/v1/object/public/" + imageUrl);
   }, [imageUrl]);

   return (
      <>
         {fileType === 'image' ? (
            <img className="w-full h-full object-contain object-center" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + imageUrl} />
         ) : fileType === 'video' ? (
            <video autoPlay muted loop className="w-full h-full object-contain object-center" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + imageUrl} />
         ) : (
            <div>Loading content type...</div>
         )}
      </>
   );
};

export default FullscreenCarousel;
