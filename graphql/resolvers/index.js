const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');

module.exports = {
    Post:{
        likeCount:(parent) =>  parent.likes.length,
        commentCount:(parent) => parent.comments.length
    },
    Query: {
        ...postsResolvers.Query
    },
    Mutation:{
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentsResolvers.Mutation
    },
    Subscription:{
        ...postsResolvers.Subscription
    }

};

/* We've defined our data set, but Apollo Server 
doesn't know that it should use that data set when it's
 executing a query. To fix this, we create a resolver.

Resolvers tell Apollo Server how to fetch the data associated
 with a particular type */