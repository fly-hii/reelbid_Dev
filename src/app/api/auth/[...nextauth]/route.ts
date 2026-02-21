import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import UserWrapper from "@/models/User";

const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_CLIENT_SECRET",
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "test@example.com" },
                password: { label: "Password (or OTP)", type: "password" }
            },
            async authorize(credentials) {
                await connectDB();
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                let user = await UserWrapper.findOne({ email: credentials.email });

                if (!user) {
                    user = await UserWrapper.create({
                        name: credentials.email.split('@')[0],
                        email: credentials.email,
                        role: 'Buyer',
                        tier: 'None',
                        walletBalance: 0,
                        profileCompleted: false,
                    });
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profileCompleted: user.profileCompleted ?? false,
                };
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                if (!user.email) return false;
                await connectDB();
                let dbUser = await UserWrapper.findOne({ email: user.email });
                if (!dbUser) {
                    dbUser = await UserWrapper.create({
                        name: user.name || user.email.split('@')[0],
                        email: user.email,
                        image: user.image || '',
                        role: 'Buyer',
                        tier: 'None',
                        walletBalance: 0,
                        profileCompleted: false,
                    });
                }
                user.id = dbUser._id.toString();
                (user as any).role = dbUser.role;
                (user as any).profileCompleted = dbUser.profileCompleted ?? false;
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).profileCompleted = token.profileCompleted;
            }
            return session;
        },
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.profileCompleted = (user as any).profileCompleted;
            }
            // Allow session updates (e.g. after profile completion)
            if (trigger === 'update') {
                await connectDB();
                const dbUser = await UserWrapper.findById(token.id);
                if (dbUser) {
                    token.profileCompleted = dbUser.profileCompleted;
                    token.role = dbUser.role;
                }
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/signin",
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export { authOptions };
