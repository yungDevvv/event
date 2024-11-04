"use client";

import * as React from "react";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";

const DatePicker = React.forwardRef(({ ...field }, ref) => {
   return (
      <Popover>
         <PopoverTrigger asChild>
            <Button
               ref={ref} // Attach the ref here
               variant={"outline"}
               className={cn(
                  "w-full justify-start text-left font-normal hover:bg-inherit",
                  !field.value && "text-muted-foreground"
               )}
            >
               <CalendarIcon className="mr-2 h-4 w-4" />
               
               {field.value instanceof Date && !isNaN(field.value.getTime())
                  ? format(field.value, "PPP", { locale: fi })
                  : <span>Valitse päivämäärä</span>
               }
               {/* {field.value ? format(new Date(Date.parse(field.value)), "PPP", { locale: fi }) : <span>Valitse päivämäärä</span>} */}
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-auto p-0" >
            <Calendar
               mode="single"
               selected={field.value}
               onSelect={field.onChange}
               initialFocus
               locale={fi}
               fromDate={new Date()}
            />
         </PopoverContent>
      </Popover>
   );
});

DatePicker.displayName = "DatePicker"; // Set display name for debugging

export default DatePicker;
