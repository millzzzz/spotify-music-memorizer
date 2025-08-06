import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"

if (!process.env.SPOTIFY_CLIENT_ID) {
  throw new Error("Missing SPOTIFY_CLIENT_ID env var")
}
if (!process.env.SPOTIFY_CLIENT_SECRET) {
  throw new Error("Missing SPOTIFY_CLIENT_SECRET env var")
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET env var")
}

const handler = NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: 'https://accounts.spotify.com/authorize?scope=user-read-email,playlist-read-private,user-library-read,streaming',
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST } 