'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, required: true },
  password: { type: String, trim: true, required: true },
  role: { type: String, default: 'User', required: true }
});

// const quotesSchema = Schema({
//   author: { type: String, required: true },
//   content: { type: String, required: true }
// });

// const entrySchema = new Schema({
//   date: { type: Date, default: Date.now },
//   title: { type: String, required: true },
//   content: { type: String, required: true }
// });

UserSchema.methods.serialize = function() {
  return {
    _id: this._id,
    name: this.name || '',
    email: this.email || '',
    password: this.password || '',
    role: this.role
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

// quotesSchema.methods.serialize = function() {
//   return {
//     _id: this._id,
//     author: this.author,
//     content: this.content
//   };
// };

// entrySchema.methods.serialize = function() {
//   return {
//     _id: this._id,
//     title: this.title,
//     date: this.date,
//     content: this.content
//   };
// };

// const Entry = model('Entry', entrySchema);
const User = mongoose.model('User', UserSchema);
// const Quote = model('Quote', quotesSchema);

module.exports = { User };
