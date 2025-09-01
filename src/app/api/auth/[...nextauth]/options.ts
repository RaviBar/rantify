import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> {
        console.log('--- Authorize Function Triggered ---');
        console.log('Received credentials object:', credentials); 

        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: { $regex: new RegExp(`^${credentials.identifier}$`, 'i') } },
              { username: { $regex: new RegExp(`^${credentials.identifier}$`, 'i') } },
            ],
          });

          if (!user) {
            console.log('LOGIN_ERROR: User not found with identifier:', credentials.identifier);
            throw new Error('No user found with this email or username.');
          }

          if (!user.isVerified) {
            console.log('LOGIN_ERROR: User found, but not verified.');
            throw new Error('Please verify your account before logging in.');
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            console.log('LOGIN_SUCCESS: Credentials valid. Returning user object.');
            return user;
          } else {
            console.log('LOGIN_ERROR: Password incorrect.');
            throw new Error('Incorrect password.');
          }
        } catch (err: any) {
          console.error('Authorize error:', err.message);
          // Re-throw the error so NextAuth.js can handle it and pass it to the frontend
          throw new Error(err.message || 'An error occurred during authentication.');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};