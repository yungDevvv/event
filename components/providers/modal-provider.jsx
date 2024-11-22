"use client";

import { useEffect, useState } from "react";
import CreateEventModal from "../modals/create-event-modal";
import { useModal } from "@/hooks/use-modal";
import MembersListModal from "../modals/members-list-modal";
import ClientChangePasswordModal from "../modals/client-change-password-modal";

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);
    
    const {isOpen, type} = useModal();

    useEffect(() => {
        setIsMounted(true);
    }, [])

    if(!isMounted) return null;
    
    return (
        <>
            {isOpen && type === "create-event" && <CreateEventModal />}
            {isOpen && type === "event-members-list" && <MembersListModal />}
            {isOpen && type === "change-password" && <ClientChangePasswordModal />}
        </>
    )
}