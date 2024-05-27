import React from 'react'
import SyncPlans from './_components/SyncPlans'

import {
  CardContainer,
  CardBody,
  CardItem
} from '@/components/ui/3d-card'
import { CheckIcon } from 'lucide-react'
import { getSubscruptionPlans, getUserSubscriptions } from '@/data'
import { PayButton } from './_components/payement-button'
import { Plan } from '@prisma/client'


import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SubscriptionStatus } from './_components/subscription-status'
import { SubscriptionDate } from './_components/subscription-date'
import { SubscriptionPrice } from './_components/subscription-price'
import { SubscriptionStatusType } from '@/lib/types'
import clsx from 'clsx'
import { SubscriptionActions } from './_components/subscription-actions'




const page = async() => {

    const data = await getSubscruptionPlans()

    const userSubscriptions = await getUserSubscriptions()

    
    // Show active subscriptions first, then paused, then canceled
   const sortedSubscriptions = userSubscriptions.sort((a, b) => {
     if (a.status === 'active' && b.status !== 'active') {
       return -1
     }
     if (a.status === 'on_trial' && b.status !== 'on_trial') {
       return -1
     }

     if (a.status === 'paused' && b.status === 'cancelled') {
       return -1
     }

     return 0
   })

    return (
      <div className='w-full h-full mx-auto px-4 overflow-hidden max-w-7xl'>
          <div className='w-full flex justify-between'>
              <h1 className='text-4xl font-bold mt-12'>Billing</h1>
              <SyncPlans />
          </div>

          {
            userSubscriptions.length !== 0 && (
              <div className='max-w-7xl'>
                <h2 className="text-2xl py-4">Historiques d'abonnements</h2>
                <Table className="bg-card border-[1px] border-border rounded-md">
                  <TableHeader className="rounded-md">
                    <TableRow>
                      <TableHead className="w-[200px]">Nom du plan</TableHead>
                      <TableHead className="w-[200px]">Statut</TableHead>
                      <TableHead className="w-[300px]">Date</TableHead>
                      <TableHead className="w-[200px]">Payé</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="font-medium truncate">
                    {sortedSubscriptions.map((charge) => (
                      <TableRow key={charge.id}>
                        <TableCell>{charge.plan.productName}</TableCell>
                        <TableCell className="text-muted-foreground">
                          <SubscriptionStatus
                            status={charge.status as SubscriptionStatusType}
                            statusFormatted={charge.statusFormatted}
                            isPaused={Boolean(charge.isPaused)}
                          />
                        </TableCell>
                        <TableCell>
                          <SubscriptionDate
                            endsAt={charge.endsAt}
                            renewsAt={charge.renewsAt}
                            status={charge.status as SubscriptionStatusType}
                            trialEndsAt={charge.trialEndsAt}
                          />  
                        </TableCell>
                        <TableCell>
                          <p
                            className={clsx('', {
                              'text-emerald-500': charge.status.toLowerCase() === 'paid',
                              'text-orange-600':
                                charge.status.toLowerCase() === 'pending',
                              'text-red-600': charge.status.toLowerCase() === 'failed',
                            })}
                          >
                            {charge.status.toUpperCase()}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <SubscriptionPrice
                              endsAt={charge.endsAt}
                              interval={charge.plan.interval}
                              intervalCount={charge.plan.intervalCount}
                              price={charge.price || charge.plan.price}
                              isUsageBased={charge.isUsageBased ?? false}
                            />
                            
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          }
          <div className='flex flex-wrap items-center justify-between flex-col md:flex-row gap-8'>
            {
              data.map((item, index) => (
                <CardContainer className='inter-var' key={index}>
                  <CardBody className='bg-card text-card-foreground relative dark:hover:shadow-2xl w-full md:!w-[350px] h-auto rounded-xl p-6 border'>

                      <div className='w-full flex justify-between items-start'>

                          <CardItem 
                              translateZ={50}
                              className='text-xl font-bold'
                          >
                              {item.productName}
                              <h2 className='text-6xl'>${Number(item.price) / 100}</h2>

                          </CardItem>
                          {
                              userSubscriptions.length > 0 && sortedSubscriptions[0]?.plan.id === (data.find((plan) => plan.id === item.id) as Plan)?.id && (
                                <SubscriptionActions
                                  subscription={sortedSubscriptions[0]}
                                />
                              )
                          }
                      </div>

                      <CardItem
                          translateZ={60}
                          className='text-sm max-w-sm mt-2'
                      >
                          The essential plan for freelancers
                          <ul className='my-4 flex flex-col gap-2'>
                              <li className='flex items-center gap-2'>
                                  <CheckIcon /> 5 products
                              </li>
                              <li className='flex items-center gap-2'>
                                  <CheckIcon /> 5 products
                              </li>
                              <li className='flex items-center gap-2'>
                                  <CheckIcon /> 5 products
                              </li>
                              <li className='flex items-center gap-2'>
                                  <CheckIcon /> 5 products
                              </li>
                              <li className='flex items-center gap-2'>
                                  <CheckIcon /> 5 products
                              </li>
                          </ul>
                      </CardItem>
                      <div className='flex justify-between items-center mt-8'>
                          <PayButton 
                                isChangingPlans={sortedSubscriptions[0]?.status === 'active' || sortedSubscriptions[0]?.status === 'on_trial'}
                                currentPlan={
                                    (sortedSubscriptions[0]?.status === 'active' || sortedSubscriptions[0]?.status === 'on_trial') ?
                                    sortedSubscriptions[0]?.plan : undefined
                                }
                                plan={data.find((plan) => plan.id === item.id) as Plan}
                                className='bg-primary text-primary-foreground'
                          />
                      </div>
                  </CardBody>
                </CardContainer>
              ))
            }
          </div>
      </div>
    )
}

export default page