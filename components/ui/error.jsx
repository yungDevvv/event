"use client"

export const Error = ({text}) => {
   return (
      <div className="fixed w-screen h-screen overflow-hidden bg-orange-100 flex items-center justify-center">
         <p className="text-red-500 text-xl font-semibold">
            {text}
         </p>
      </div>
   )
}