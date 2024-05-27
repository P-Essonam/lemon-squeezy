'use client'

import { useState } from 'react'
import { Loader2, MoreVerticalIcon } from 'lucide-react'

import { cancelUserSubscription, getSubscriptionURLs, pauseUserSubscription, unpauseUserSubscription } from '@/data'
import { Subscription } from '@prisma/client'
import { LemonSqueezyModalLink } from './modal-link'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'



export function SubscriptionActionsDropdown({
  subscription,
  urls,
}: {
  subscription: Subscription
  urls: Awaited<ReturnType<typeof getSubscriptionURLs>>
}) {

  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (
    subscription.status === 'expired' ||
    subscription.status === 'cancelled' ||
    subscription.status === 'unpaid'
  ) {
    return null
  }

  return (
    <AlertDialog>
      {loading && (
        <div className="bg-surface-50/50 absolute inset-0 z-10 flex items-center justify-center rounded-md">
          <Loader2 className='w-8 h-8 animate-spin text-primary'  />
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger>
            <MoreVerticalIcon className="text-primary w-6 h-6" />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuGroup>
            {!subscription.isPaused && (
              <DropdownMenuItem
                onClick={async () => {
                  try {
                        setLoading(true)
                        await pauseUserSubscription(subscription.lemonSqueezyId)
                        router.refresh()
                        toast.success('Votre abonnement est en pause.')
                   }catch (error) {
                    toast.error("Votre abonnement a été annulé. Une erreur s'est produite lors de l'annulation de votre abonnement. Veuillez réessayer plus tard.")
                   } finally {
                        setLoading(false)
                   }
                }}
              >
                Mettre en pause l'abonnement
              </DropdownMenuItem>
            )}

            {subscription.isPaused && (
              <DropdownMenuItem
                onClick={async () => {

                    try{
                        setLoading(true)
                        await unpauseUserSubscription(subscription.lemonSqueezyId)
                        router.refresh()
                        toast.success('Votre abonnement a été réactivé.')
                    }catch (error) {
                        toast.error("Votre abonnement a été annulé. Une erreur s'est produite lors de l'annulation de votre abonnement. Veuillez réessayer plus tard.")
                    } finally {
                        setLoading(false)
                    }
                }}
              >
                Reprendre l'abonnement
              </DropdownMenuItem>
            )}

            <DropdownMenuItem asChild>
              <a href={urls?.customer_portal}>Portail client ↗</a>
            </DropdownMenuItem>

            <LemonSqueezyModalLink href={urls?.update_payment_method}>
                Mise à jour du mode de paiement
            </LemonSqueezyModalLink>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className='text-red-600'
            >
                <AlertDialogTrigger>
                    Annuler l'abonnement
                </AlertDialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

        <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
              Êtes-vous absolument sûr ?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
              Cette action ne peut être annulée. Cette action annulera définitivement 
                définitivement votre abonnement.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center">
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                disabled={loading}
                className="bg-destructive"
                onClick={async () => {

                    try {
                        setLoading(true)
                        await cancelUserSubscription(subscription.lemonSqueezyId)
                        router.refresh()
                        toast.success('Votre abonnement a été annulé.')
                    } catch (error) {
                        toast.error("Votre abonnement a été annulé. Une erreur s'est produite lors de l'annulation de votre abonnement. Veuillez réessayer plus tard.")
                    } finally {
                        setLoading(false)
                    }
                    
                }}
              >
                {"Résiliation"}
              </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}