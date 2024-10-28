"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const MultipleSelectWithCheckbox = React.forwardRef(({ placeholder, options, field }, ref) => {
  const handleChange = (checked, value) => {
    const newValues = checked
      ? [...field.value, value]
      : field.value.filter((item) => item !== value);
    field.onChange(newValues);
  };

  return (
    <Select>
      <SelectTrigger className="w-full" ref={ref}>
        <span className={cn("block truncate", field.value.length === 0 && "text-muted-foreground")}>
          {field.value && field.value.length > 0 ? field.value.join(", ") : placeholder}
        </span>
      </SelectTrigger>
      <SelectContent className="w-full">
        <SelectGroup>
          {options.map((option) => (
            <div
              key={option}
              className="flex items-center justify-between p-2 text-sm hover:bg-muted cursor-pointer"
              onClick={() => handleChange(!field.value.includes(option), option)}
            >
              <span>{option}</span>
              <Checkbox checked={field.value.includes(option)} />
            </div>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
});

MultipleSelectWithCheckbox.displayName = "MultipleSelectWithCheckbox";

export default MultipleSelectWithCheckbox;


// "use client";

// import * as React from "react";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// const MultipleSelect = React.forwardRef(({ placeholder, options, field }, ref) => {
//   const handleChange = (checked, value) => {
//     const newValues = checked
//       ? [...field.value, value]
//       : field.value.filter((item) => item !== value);
//     field.onChange(newValues);
//   };

//   return (
//     <DropdownMenu className="w-full">
//       <DropdownMenuTrigger asChild>
//         <Button className="w-full justify-start font-normal" variant="outline" ref={ref}>
//           <span className="block truncate">
//             {field.value && field.value.length > 0 ? (
//               field.value.join(", ")
//             ) : (
//               placeholder
//             )}
//           </span>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className="w-full">
//         {options.map((option) => (
//           <DropdownMenuCheckboxItem
//             key={option}
//             checked={field.value.includes(option)}
//             onCheckedChange={(checked) => handleChange(checked, option)}
//           >
//             {option}
//           </DropdownMenuCheckboxItem>
//         ))}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// });

// MultipleSelect.displayName = "MultipleSelect";

// export default MultipleSelect;
