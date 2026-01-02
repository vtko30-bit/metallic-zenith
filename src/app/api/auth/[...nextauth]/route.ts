import NextAuth, { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('CRITICAL: NEXTAUTH_SECRET is not defined in process.env');
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development' || true, // Force true to debug Vercel
  logger: {
    error: (code, metadata) => {
      console.error('NEXTAUTH ERROR:', code, metadata);
    },
    warn: (code) => {
      console.warn('NEXTAUTH WARN:', code);
    },
    debug: (code, metadata) => {
      console.log('NEXTAUTH DEBUG:', code, metadata);
    }
  },
  session: {
    strategy: 'jwt',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
