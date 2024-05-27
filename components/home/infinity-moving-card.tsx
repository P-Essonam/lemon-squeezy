import React from 'react'


import {
    CardContainer,
    CardBody,
    CardItem
} from '@/components/ui/3d-card'
import { CheckIcon } from 'lucide-react'
import Link from 'next/link'
const InfinityMovingCard = () => {
  return (
    <div className='flex flex-wrap items-center justify-center flex-col md:flex-row gap-8'>
        <CardContainer className='inter-var'>
            <CardBody className='bg-card text-card-foreground relative dark:hover:shadow-2xl w-full md:!w-[350px] h-auto rounded-xl p-6 border'>
                <CardItem 
                    translateZ={50}
                    className='text-xl font-bold'
                >
                    Freelancer
                    <h2 className='text-6xl'>$5</h2>
                </CardItem>
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
                    <CardItem
                        translateZ={20}
                        className='px-4 py-2 rounded-xl text-sm font-normal'
                        as={"button"}
                    >
                        <Link href='/auth/sign-in'>
                            Essayer 
                        </Link>
                    </CardItem>
                    <CardItem
                        translateZ={20}
                        as={'button'}
                        className='px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold'
                    >
                        <Link href='/auth/sign-in'>
                            Commencer ici
                        </Link>
                    </CardItem>
                </div>
            </CardBody>
        </CardContainer>
        <CardContainer className='inter-var'>
            <CardBody className='bg-card text-card-foreground relative dark:hover:shadow-2xl w-full md:!w-[350px] h-auto rounded-xl p-6 border'>
                <CardItem 
                    translateZ={50}
                    className='text-xl font-bold'
                >
                    Start-up
                    <h2 className='text-6xl'>$29</h2>
                </CardItem>
                <CardItem
                    translateZ={60}
                    className='text-sm max-w-sm mt-2'
                >
                    The essential plan for start-up
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
                    <CardItem
                        translateZ={20}
                        className='px-4 py-2 rounded-xl text-sm font-normal'
                        as={"button"}
                    >
                        <Link href='/auth/sign-in'>
                            Essayer 
                        </Link>
                    </CardItem>
                    <CardItem
                        translateZ={20}
                        as={'button'}
                        className='px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold'
                    >
                        <Link href='/auth/sign-in'>
                            Commencer ici
                        </Link>
                    </CardItem>
                </div>
            </CardBody>
        </CardContainer>
        <CardContainer className='inter-var'>
            <CardBody className='bg-card text-card-foreground relative dark:hover:shadow-2xl w-full md:!w-[350px] h-auto rounded-xl p-6 border'>
                <CardItem 
                    translateZ={50}
                    className='text-xl font-bold'
                >
                    Enterprise
                    <h2 className='text-6xl'>$99</h2>
                </CardItem>
                <CardItem
                    translateZ={60}
                    className='text-sm max-w-sm mt-2'
                >
                    The essential plan for Enterprise
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
                    <CardItem
                        translateZ={20}
                        className='px-4 py-2 rounded-xl text-sm font-normal'
                        as={"button"}
                    >
                        <Link href='/auth/sign-in'>
                            Essayer 
                        </Link>
                    </CardItem>
                    <CardItem
                        translateZ={20}
                        as={'button'}
                        className='px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold'
                    >
                        <Link href='/auth/sign-in'>
                            Commencer ici
                        </Link>
                    </CardItem>
                </div>
            </CardBody>
        </CardContainer>
    </div>
  )
}

export default InfinityMovingCard