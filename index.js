const { ApolloServer,PubSub } = require('apollo-server');// 1) pup sub for subscriptions

const mongoose = require('mongoose');


const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const { MONGODB } = require('./config.js');

const pubsub = new PubSub();// 2) create new pubsub

const PORT = process.env.port || 5000

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req})=>({req,pubsub})//3 pass it to apollo server context here, go to typedef.js for next step
});

mongoose
        .connect(MONGODB, { useNewUrlParser:true})
        .then(()=>{
            console.log("MongoDB Connected")
            return server.listen({ port: PORT })
        })
        .then((res) => {
            console.log(`Server running at ${res.url}`);
        })
        .catch(err=>{
            console.error(err)
        });