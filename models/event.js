const mongoose = require('mongoose')

const Schema = mongoose.Schema

const eventSchema = new Schema({
  serialNumber: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

module.exports = mongoose.model('Event', eventSchema)