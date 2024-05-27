"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";


declare global {
    interface Window {
        LemonSqueezy: any;
    }
}



export function LemonSqueezyModalLink({
  href,
  children,
}: {
  href?: string;
  children: ReactNode;
}) {
    useEffect(() => {
        if (typeof (window as any).createLemonSqueezy === "function") {
            (window as any).createLemonSqueezy();
        }
    }, []);

    const router = useRouter();
    return (
        <DropdownMenuItem
            onClick={() => {
                if (href) {
                    router.push(href);
                } else {
                throw new Error(
                    "href provided for the Lemon Squeezy modal is not valid.",
                );
                }
            }}
        >
        {children}
        </DropdownMenuItem>
    );
}