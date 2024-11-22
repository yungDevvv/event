"use client";

import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
   DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useState } from 'react';
import { useModal } from '@/hooks/use-modal';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';

const ClientChangePasswordModal = () => {
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [errorMessage, setErrorMessage] = useState("");
   const supabase = createClient();

   const { toast } = useToast();
   const { isOpen, onClose, type } = useModal();

   const isModalOpen = isOpen && type === "change-password";

   const router = useRouter();

   const changePassword = async () => {
      if (password === "") {
         setErrorMessage("Salasana kenttä on pakollinen")
         return;
      }
      if (confirmPassword === "") {
         setErrorMessage("Salasanan vahvistus kenttä on pakollinen");
         return;
      }
      if (password !== confirmPassword) {
         setErrorMessage("Salasanojen täytyy olla samanlaiset!");
         return;
      }
      try {
         await supabase.auth.updateUser({ password })
         toast({
            variant: "success",
            title: "Salasana",
            description: "Salasanan on nyt vaihdettu!"
         });
         router.push("/dashboard/events")
         router.refresh()
         onClose();

      } catch (e) {
         console.error(e);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe vaihtaessa salasana."
         });
         return;
      }
   }
   return (
      <Dialog open={isModalOpen} onOpenChange={onClose}>
         <DialogContent className='bg-white text-black p-6'>
            <DialogHeader className=''>
               <DialogTitle className='text-2xl text-center font-bold'>
                  Vaihda salasana
               </DialogTitle>
            </DialogHeader>
            <DialogDescription></DialogDescription>
            <div>
               {errorMessage && <p className='text-red-500 mb-3'>{errorMessage}</p>}
               <Label>Uusi salasana</Label>
               <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
               <Label>Salasana vahvistus</Label>
               <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button className="bg-clientprimary hover:bg-clientprimary" onClick={() => changePassword()}>Vaihda</Button>
         </DialogContent>
      </Dialog>
   );
}

export default ClientChangePasswordModal;
