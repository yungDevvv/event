"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Check, X } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast()

  return (
    (<ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          (<Toast key={id} {...props}>
            <div className="flex items-center text-black">
              {props.variant === "success" && (
                <div className="rounded-md p-2 bg-green-100 mr-3">
                  <div className="rounded-full bg-green-500 flex items-center justify-center p-1">
                    <Check className="text-white" size={18} strokeWidth={3} />
                  </div>
                </div>
              )}
              {props.variant === "supabaseError" && (
                <div className="rounded-md p-2 bg-red-100 mr-3">
                  <div className="rounded-full bg-red-500 flex items-center justify-center p-1">
                    <X className="text-white" size={18} strokeWidth={3} />
                  </div>
                </div>
              )}
              {console.log(props.variant)}
              <div>
                {/* {title && ( */}
                <ToastTitle>
                  {props.variant === "supabaseError" ? "500 Internal Server Error" : title}
                </ToastTitle>
                {/* // )} */}
                {description && (
                  <ToastDescription>
                    {description}
                  </ToastDescription>
                )}
              </div>

            </div>
            {action}
            <ToastClose />
          </Toast>)
        );
      })}
      <ToastViewport />
    </ToastProvider>)
  );
}
