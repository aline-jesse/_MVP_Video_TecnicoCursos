
import NextAuth from 'next-auth'
import { authConfig } from './auth-config'

const nextAuth = NextAuth(authConfig)

export const { handlers } = nextAuth
export { authConfig }
export const authOptions = authConfig
