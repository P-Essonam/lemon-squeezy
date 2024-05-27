import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig from "./auth.config"
import { db } from "./lib/db"
import { getUserById } from "./data/auth"
import { UserRole } from "@prisma/client"



 
export const { 
    auth, 
    handlers, 
    signIn, 
    signOut 
} = NextAuth({
    trustHost: true,
    pages: {
      signIn: '/auth/sign-in',  
      error: '/auth/error'
    },
    callbacks: {
        async signIn({ user, account }){
           return true 
        },

        async session({ token, session }) {

            if(token.sub && session.user){
                session.user.id = token.sub
            }

            if(token.role && session.user){
                session.user.role = token.role as UserRole
            }

            return session
            
        },

        async jwt({ session, token }) {

            if(!token.sub) return token

            const existingUser = await getUserById(token.sub)

            if(!existingUser) return token

            token.role = existingUser.role as UserRole

            return token

        },
    },
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    ...authConfig,
})