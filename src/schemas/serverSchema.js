const { model, Schema } = require('mongoose');

let serverSchema = new Schema({
  GuildID: String,
  Description: String,
  Tag: {
    Type: Array,
    Default: []
  },
  Invite: String,
})

module.exports = model('serverSchema', serverSchema);