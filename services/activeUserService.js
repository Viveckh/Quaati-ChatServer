import {db, MessageCollection, ActiveUsersCollection} from './../db/index.js'

export default {
  async addActiveUser(username) {
    try {
      let res = await ActiveUsersCollection().insertOne(username);
      return res;
    }
    catch(err){
      console.log("Mongo Error during adding active user");
      console.log(err)
      return null;
    }
  }
}