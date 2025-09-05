import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import FacebookProvider from 'next-auth/providers/facebook';
import GoogleProvider from 'next-auth/providers/google';
import { cookies } from 'next/headers';
import User from './models/User';
import connectDB from './mongodb';

// NextAuth v5 setup compatible with Next.js 15 (async headers/cookies)
export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password as string);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        } as any;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        await connectDB();
        
        // Check if user exists
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Create new user from social login
          const [firstName, ...lastNameParts] = (user.name || '').split(' ');
          const lastName = lastNameParts.join(' ') || '';
          
          const newUser = await User.create({
            email: user.email,
            firstName: firstName || '',
            lastName: lastName || '',
            phone: '', // Will be filled later
            role: 'customer',
            isActive: true,
            emailVerified: true, // Social login emails are verified
            authProvider: account.provider,
            authProviderId: profile?.sub || profile?.id,
            profileImage: '', // Initialize as empty string
          });
          
          user.id = newUser._id.toString();
          user.role = newUser.role;
        } else {
          // Update existing user's auth provider info
          existingUser.authProvider = account.provider;
          existingUser.authProviderId = profile?.sub || profile?.id;
          existingUser.emailVerified = true;
          await existingUser.save();
          
          user.id = existingUser._id.toString();
          user.role = existingUser.role;
        }
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // persist role on token
        (token as any).role = (user as any).role;
        (token as any).id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.sub) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token as any).role as string;
      }
      return session;
    },
  },
  pages: { signIn: '/auth/signin' },
});

export type SimpleSession = {
  user: {
    id: string;
    role: string;
  };
} | null;

// Helper for Next.js 15: avoid next-auth's sync cookies() by reading session JWT directly
export async function getSessionFromCookies(): Promise<SimpleSession> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('__Secure-next-auth.session-token')?.value ||
    cookieStore.get('next-auth.session-token')?.value;

  if (!token) return null;

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  try {
    const decoded = jwt.verify(token, secret) as any;
    const userId = (decoded?.sub || decoded?.userId || '') as string;
    const role = (decoded?.role || '') as string;
    if (!userId) return null;
    return { user: { id: userId, role } };
  } catch (_err) {
    return null;
  }
}