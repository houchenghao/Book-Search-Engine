const { AuthenticationError} = require('apollo-server-express');
// import user model
const { User } = require('../models');
// import sign token function from auth
const { signToken } = require('../utils/auth');

const resolvers = {

  Query: {
    me: async(parent, args, context) =>{
      if(context.user){
        return User.findOne({ _id: context.user.id }).populate("savedBooks");
      }
      throw new AuthenticationError('You need to be logged in!')
    },
  },

  Mutation:{
    login: async (parent, {email, password}) => {
      const user = await User.findOne({email});

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      };

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      };

      const token = signToken(user);

      return { token, user };
    },

    addUser: async(parent, {username, email, password}) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    saveBook: async(parent, {author, description, title, bookId, image, link}, context) => {
      if(context.user){
        await User.findOneAndUpdate(
          {_id: context.user.id},
          {
            $addToSet: {
              savedBooks:{author, description, title, bookId, image, link}
            }
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      throw new AuthenticationError('You need to logged in!')
    },

    removeBook: async (parent, {bookId}, context) => {
      if(context.user){
        await User.findOneAndUpdate(
          {_id:context.user._id},
          { $pull: {savedBooks: {bookId: bookId}}},
          {new: true}
        )
      }
      throw new AuthenticationError('You need to logged in!')
    }
  }
};
module.exports = resolvers;


module.exports = resolvers;