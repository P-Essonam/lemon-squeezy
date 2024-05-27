"use client"

import React from 'react'


import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'

import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
    CardDescription
} from '@/components/ui/card'
import { Button } from '../ui/button'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import FormError from '../form-error'


const LoginForm = () => {

    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl')
    const urlError = searchParams.get('error') === "OAuthAccountNotLinked"
    ? "Email already in use with different account"
    : ""


    const onclick = (provider: "google" | "github") => {
        signIn(provider, { callbackUrl: DEFAULT_LOGIN_REDIRECT || callbackUrl})
    }


    return (
        <Card className='max-w-sm'>
            <CardHeader>
                <CardTitle className='text-2xl'>Login</CardTitle>
                <CardDescription>Register using your google or github account to accees our platform</CardDescription>

            </CardHeader>

            <CardContent className='space-y-4'>

                <FormError message={urlError}/>

                <Button
                    variant="outline"
                    className="w-full space-x-2 flex"
                    onClick={() => onclick('google')}
                >
                    <FcGoogle className='w-5 h-5' />
                    <span>Login with google</span>
                </Button>


                <Button
                    variant="outline"
                    className="w-full space-x-2 flex"
                    onClick={() => onclick('github')}
                >
                    <FaGithub className='w-5 h-5' />
                    <span>Login with github</span>
                </Button>


            </CardContent>

        </Card>
    )
}

export default LoginForm