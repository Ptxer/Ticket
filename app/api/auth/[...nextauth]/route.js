import mysql from 'mysql2/promise';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth from 'next-auth/next';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

const authOption = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials, req) {
        const { email, password } = credentials;

        try {

          const connection = await mysql.createConnection(dbConfig);

          const [rows] = await connection.execute(
            'SELECT * FROM user WHERE email = ?',
            [email]
          );

          await connection.end();

          if (rows.length > 0) {
            const user = rows[0];

            console.log("User found:");

            if (user.password === password) {

              return { email: user.email, name: user.name };
            } else {
              console.log("Password does not match.");
            }
          } else {
            console.log("No user found with this email.");
          }

          return null;
        } catch (error) {
          console.error('Error in MySQL authentication:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/Login',
  },
};


const handler = NextAuth(authOption);
export { handler as GET, handler as POST };
