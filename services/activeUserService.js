import {db, MessageCollection, ActiveUsersCollection} from './../db/index.js'

export default {
  async addActiveUser(username) {
    try {
      let res = await ActiveUsersCollection().insertOne(username);
      return res;
    }
    catch(err){
      console.log(err)
      return null;
    }
  },

  async getAllFriendsChattedWith(username){
    try {
      let res = await MessageCollection().find({
        $or: [
          {user: parseInt(username)},
          {to: parseInt(username)}
        ]
      }).project({to : 1, chatId: 1, user: 1, messages: 1}).toArray();
      
      return res;
    }catch(err){
      console.log(err)
      return null;
    }
  }


}