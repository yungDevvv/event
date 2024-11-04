import { SquareX } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const DiaImage = ({ post, selectedPosts, handleCheckboxChange }) => {
   const [fileType, setFileType] = useState(null)

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

   useEffect(() => {
      getMimeTypeFromUrl("https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url)
   }, [post.image_url])

   return (
      <div key={post.id} className="relative overflow-hidden rounded-lg shadow-md h-[350px]">
         <div
            className={`w-full h-full ${selectedPosts[post.id] ? "bg-black opacity-90 blur-sm" : ""}`}
         > 
            {fileType === "image" && <img src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url} alt="Post image" className="w-full h-full object-cover" />}
            {fileType === "video" && <video autoPlay muted loop controls className="rounded-xl w-full h-full object-contain" src={"https://supa.crossmedia.fi/storage/v1/object/public/" + post.image_url} />}
         </div>
         <input
            type="checkbox"
            checked={!!selectedPosts[post.id]}
            onChange={() => handleCheckboxChange(post.id)}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
         />
         {selectedPosts[post.id] && (
            <div className="absolute inset-0 flex items-center justify-center">
               <SquareX className="text-white w-24 h-24" />
            </div> 
         )}
      </div>
   )
}

export default DiaImage;