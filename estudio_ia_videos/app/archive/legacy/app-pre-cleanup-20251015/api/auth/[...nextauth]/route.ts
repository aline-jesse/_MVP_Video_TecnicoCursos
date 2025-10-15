
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'

// authOptions moved to auth config file

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }
