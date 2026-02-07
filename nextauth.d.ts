import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface User {
    roles?: string[]
    isActive?: boolean
  }
  interface Session {
    user: { id: string; roles?: string[] } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    roles?: string[]
  }
}
