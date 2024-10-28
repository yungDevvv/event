"use client";

import { useEffect, useState } from "react";
import CreateEventModal from "../modals/create-event-modal";
import { useModal } from "@/hooks/use-modal";

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
        </>
    )
}