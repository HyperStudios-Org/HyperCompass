const { model, Schema } = require('mongoose');

let userSchema = new Schema({
  User: String,
  Username: String,
  Bio: String,
  ProfileIcon: String,
  Link: {
    Type: Array,
    Default: []
  },
  Commands: Number,
  HyperCoins: Number,
  Quest: {
    Type: Array,
    Default: []
  },
  Item: {
    Type: Array,
    Default: []
  },
  Box: {
    Type: Array,
    Default: []
  },
  Creazione: Date,
  Sospeso: Boolean
})

module.exports = model('userSchema', userSchema);