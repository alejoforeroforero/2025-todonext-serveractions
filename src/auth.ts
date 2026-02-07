import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string

        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
          const newUser = await prisma.user.create({
            data: {
              email,
              password: bcrypt.hashSync(password, 10),
              isActive: true,
              roles: ["user"],
              name: email.split("@")[0],
            },
          })
          return newUser
        }

        if (!bcrypt.compareSync(password, user.password ?? "")) {
          return null
        }

        return user
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn() {
      return true
    },
    async jwt({ token }) {
      const dbUser = await prisma.user.findUnique({
        where: { email: token.email ?? "no-email" },
      })
      if (dbUser?.isActive === false) {
        throw Error("Usuario no está activo")
      }

      token.roles = dbUser?.roles ?? ["no-roles"]
      token.id = dbUser?.id ?? "no-uuid"

      return token
    },
    async session({ session, token }) {
      if (session && session.user) {
        session.user.roles = token.roles
        session.user.id = token.id
      }

      return session
    },
  },
})
