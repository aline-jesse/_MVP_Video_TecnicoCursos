
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'demo',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // For demo purposes, accept any valid email/password
        if (credentials.email?.includes('@') && credentials.password?.length >= 3) {
          return {
            id: `user-${Date.now()}`,
            email: credentials.email,
            name: credentials.email.split('@')[0] || 'User'
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/',
    signOut: '/',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'demo-secret-key-change-in-production',
}
