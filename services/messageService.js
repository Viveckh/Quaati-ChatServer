import {
  db,
  MessageCollection,
  ActiveUsersCollection
} from './../db/index.js'

export default {
  async getChatHistory(chatId) {
    try {
      let res = await MessageCollection().find({
        chatId: parseInt(chatId)
      }).project({
        messages: 1,
        chatId: 1
      }).toArray();
      
      return res;
    } catch (err) {
      console.log(err)
      return null;
    }
  }
}