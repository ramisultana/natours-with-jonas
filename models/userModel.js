const crypto = require('crypto');
const mongoose = require('mongoose');

const validator = require('validator'); // its a library in github

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'A user must have a Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  }, // the path to the photo stored in this field
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 8,
    select: false, // we hide it from the output(response )
  },

  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      // (this) only work on save  and creat not with findbyidandupdate cuz mongoose dont keep current obj in memory, mean (this) wont work with update
      validator: function (el) {
        return el === this.password; //// el represent the passwordConfirm the user wrote in a post
      },
      message: 'Passwords are not the same! ',
    },
  },
  passwordChangeAt: Date,
  PasswordResetToken: String,
  PasswordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false, // we hide it from the output(response )
  },
});
//FIXME: when importing data(user already have encryp pass) we need to turn off encrypt password  middleware TODO:(
// 1)userSchema. pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   this.passwordConfirm = undefined; // here we deleted from our dataBase cuz required fields are for input data
//   next();
// });
//  2)  userSchema.pre('save', async function (next) {
//   if (!this.isModified('password') || this.isNew) return next();
//   this.passwordChangeAt = Date.now() - 1000;
//   next();
// });)
//encrypt password happen betwwen we recieve doc and save it so we use Document Middleware , (this) point to current user(document) , and (!this.isModified('password') mean if password not modified return to next middleware , like do nothing
//TODO: then turn it again
//FIXME: pre(save)happen befor save data ,
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // here we deleted from our dataBase cuz required fields are for input data
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  //this point to current query
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword); // the rsult is true or false
};
//(this)point to current document
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    //console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  //JWTTimestamp is iat when token  created
  //false mean not changed
  return false;
};
userSchema.methods.creatPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  //never store resetToken in database , just send it to user mail
  //in dataBase we save the crypted resetToken(this.PasswordResetToken)
  this.PasswordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //console.log({ resetToken }, this.PasswordResetToken);
  this.PasswordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
