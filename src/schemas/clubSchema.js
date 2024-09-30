const { model, Schema } = require('mongoose');

let clubSchema = new Schema({
 ClubName: String,
 ClubID: String,
 ClubDescription: String,
 Ruoli: { 
    type: Array,
    default: []
  },
  Points: Number,
  Rank: String,
  Member: {
    type: Array,
    default: []
  },
  ActiveQuests: {
    type: Array,
    default: []
  },
  GuildID: String,
  LogChannel: String


})

module.exports = model('clubSchema', clubSchema);