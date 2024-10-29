import { 
   Select, 
   SelectValue,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectGroup
 } from "@/components/ui/select";
 
import {
   SidebarContent,
   SidebarItem,
} from "@/components/ui/sidebar";



const AdminSidebarContent = () => {

   return (
      <SidebarContent>
          <SidebarItem>
            <Select>
               <SelectTrigger className="w-full">
                  <SelectValue placeholder="Valitse yrityksen" />
               </SelectTrigger>
               <SelectContent>
                  <SelectGroup>
                     <SelectItem value="respa">RespaSolutions Oy</SelectItem>
                     <SelectItem value="pois">Pois Tieltä</SelectItem>
                  </SelectGroup>
               </SelectContent>
            </Select>
         </SidebarItem>
         <SidebarItem>
            You are superadmin
         </SidebarItem>
      </SidebarContent>
   )
}

export default AdminSidebarContent;