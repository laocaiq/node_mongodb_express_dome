const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TopicSchema = new Schema({
  title:{
    type:String
  }
})

module.exports = mongoose.model('Topic',TopicSchema)