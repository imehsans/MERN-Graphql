const express = require('express');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServer } = require('@apollo/server');
const cors = require('cors');
const axios = require('axios');

async function startServer() {
   const app = express();

   const server = new ApolloServer({
      typeDefs: `
            type User {
               id: ID!
               name: String!
               username: String!
               email: String!
               website: String!
            }
            type Todo {
               id: ID!
               title: String!
               completed: Boolean!
               userId: ID!
               user: User
            }
            type Query {
               getTodos: [Todo]
               getUser(id: ID!): User
               getAllUsers: [User]
            }

         `,
      resolvers: {
         Todo: {
            user: async (todo) => (
               await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`)
            ).data
         },
         Query: {
            getTodos: async () => {
               const { data } = await axios.get('https://jsonplaceholder.typicode.com/todos');
               return data;
            },
            getUser: async (_, { id }) => {
               const { data } = await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`);
               return data;
            },
            getAllUsers: async () => {
               const { data } = await axios.get('https://jsonplaceholder.typicode.com/users');
               return data;
            }
         }
      }
   });

   // Middleware setup
   app.use(cors());
   app.use(express.json()); // Use either express.json() or bodyParser.json(), not both

   try {
      await server.start();
      app.use('/graphql', expressMiddleware(server));
      app.listen(process.env.PORT || 8000, () => {
         console.log(`Server is running on port ${process.env.PORT || 8000}`);
      });
   } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1); // Exit process on failure
   }
}

startServer();