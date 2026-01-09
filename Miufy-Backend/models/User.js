const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  displayUsername: {
    type: String,
    required: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  }
});

module.exports = mongoose.model('User', UserSchema);