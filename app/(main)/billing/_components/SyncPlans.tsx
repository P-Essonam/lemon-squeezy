"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { syncPlans } from '@/data'
import { useRouter } from 'next/navigation'

const SyncPlans = () => {

    const router = useRouter()
    const onClick  = async () => {
        try {
            await syncPlans()
            router.refresh()
        } catch (error) {
            console.error(error)
        }
    }
  return (
    <Button
        onClick={onClick}
        className='mt-12'
    >
        Sync plans
    </Button>
  )
}

export default SyncPlans