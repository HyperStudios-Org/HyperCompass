const { model, Schema } = require('mongoose');

let serverSchema = new Schema({
  GuildID: String,
  Description: String,
  Rank: String,
  Points: String,
  Decoration: {
    Type: Array,
    Default: []
  },
})

module.exports = model('serverSchema', serverSchema);