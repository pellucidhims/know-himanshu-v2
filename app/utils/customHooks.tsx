'use client';
import { useEffect, useState } from "react";

export const useOutsideClick = (callback: Function, ref: any) => {
    const handleOutsideClick = (e: any) => {
        if(ref.current && !ref.current.contains(e.target)){
            callback();
        }
    }

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick)
    }, [])
}