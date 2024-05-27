"use client"
import { ComponentProps, ElementRef, forwardRef, useEffect, useState } from "react";
import { Button } from "@lemonsqueezy/wedges";
import { Plan } from "@prisma/client";
import { useRouter } from "next/navigation";
import { CheckIcon, Loader2, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { changePlan, getCheckoutURL } from "@/data";





type ButtonElement = ElementRef<typeof Button>;

type ButtonProps = ComponentProps<typeof Button> & {
    isChangingPlans?: boolean;
    currentPlan?: Plan;
    plan: Plan;
    className?: string;
};


declare global {
    interface Window {
        LemonSqueezy: any;
    }
}

export const PayButton = forwardRef<ButtonElement, ButtonProps>(
    (props, ref) => {


        const router = useRouter();
        const [loading, setLoading] = useState(false);


        
        const {
            plan,
            className,
            currentPlan,
            isChangingPlans = false,
            ...otherProps
        } = props;


        const isCurrent = plan && plan.id === currentPlan?.id;

        const label = isCurrent
        ? "Plan courant "
        : isChangingPlans
          ? "Switcher a ce plan"
          : "Choisir ce plan";

        useEffect(() => {
            if (typeof (window as any).createLemonSqueezy === "function") {
                (window as any).createLemonSqueezy();
            }
        }, []);

        const before = loading ? (
            <Loader2 className="w-10 h-10" />
        ) : props.before ?? isCurrent ? (
            <CheckIcon className="size-4" />
        ) : (
            <PlusIcon className="size-4" />
        );

        return (
            <Button
                ref={ref}
                className={cn(className, 'w-full flex')}
                before={before}
                disabled={loading || isCurrent || props.disabled}
                onClick={async () => {
                    if (isChangingPlans) {
                        try {
                          if (!currentPlan?.id) {
                            throw new Error("Current plan not found.");
                          }
              
                          if (!plan.id) {
                            throw new Error("New plan not found.");
                          }
              
                          setLoading(true);
                          const response = await changePlan(currentPlan.id, plan.id);
                          if (response.error) {
                            throw new Error("An error occurred while changing your plan.");
                          }
                          router.refresh();
                          toast.success("Your plan has been changed.");
                          return;
                        } catch (error) {
                          toast.error("An error occurred while changing your plan.");
                        }finally {
                          setLoading(false);
                        }
                    }

                    let checkoutUrl: string | undefined = "";
                    try {
                      setLoading(true);
                      checkoutUrl = await getCheckoutURL(plan.variantId);
                    } catch (error) {
                      setLoading(false);
                      toast("Error creating a checkout.", {
                        description:
                          "Please check the server console for more information.",
                      });
                    } finally {
                      setLoading(false);
                    }
          
                    router.push(checkoutUrl ?? '');


                }}

                {...otherProps}
            >
                {label}
            </Button>
        )
})



PayButton.displayName = 'PayButton';

