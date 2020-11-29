const Post = require('../../models/Post');
const checkAuth = require('../../util/check-auth');
const { AuthenticationError, UserInputError } = require('apollo-server');
const { argsToArgsConfig } = require('graphql/type/definition');



module.exports = {
    Query :  {
        async getPosts(){
            try{
                const posts = await Post.find().sort({ createdAt:-1 });// fetches al if no parameters are given
                return posts;
            } catch(err){
                throw new Error(err)
            }
        },
        async getPost(_, { postId }){
            try{
                const post = await Post.findById(postId);
                if(post){
                    return post;
                } else {
                    throw new Error("Post not found");
                }
            } catch(err){
                throw new Error(err);
            }
        }
    },
    Mutation:{
        async createPost(_, { body }, context){//with context you have request body therefore headers, and therefore authentication. this connects to apollo server contes in index.js.
            const user = checkAuth(context);
            
            if(body.trim() === ''){
                throw new Error("Post body must not be empty");
            }
            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            });

            const post = await newPost.save();
            //step 6 (subscription) do the following when creating a new post
            context.pubsub.publish('NEW_POST', {
                newPost:post
            });

            return post;
        },
        async deletePost(_,{ postId }, context){
            const user = checkAuth(context);
            try{
                const post = await Post.findById(postId);
                if(user.username === post.username){
                    await post.delete();
                    return "Post deleted successfully"
                } else {
                    throw new AuthenticationError("Action not allowed")
                }
            } catch(err){
                throw new Error(err)
            }
        },
        async likePost(_, { postId }, context){
            const { username } = checkAuth(context);

            const post = await Post.findById(postId);

            if(post){
                if(post.likes.find(like=>like.username === username)){
                    //Post already liked, unlike it 
                    post.likes = post.likes.filter(like=>like.username !== username )
                    } else {
                    //Not liked, like post
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }

                await post.save();
                return post;
            } else throw new UserInputError("Post Not Found")
        }
    },
    // Step 5, subscription declared here
    Subscription: {
        newPost:{
            subscribe: (_,__,{ pubsub }) => pubsub.asyncIterator('NEW_POST')
        }
        // go to createPost above for next step
    }
}

/* We've defined our data set, but Apollo Server 
doesn't know that it should use that data set when it's
 executing a query. To fix this, we create a resolver.

Resolvers tell Apollo Server how to fetch the data associated
 with a particular type */