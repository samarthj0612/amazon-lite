var mongoose = require("mongoose");
var plm = require("passport-local-mongoose");
mongoose.connect("mongodb://localhost:27017/amazon");

var userSchema = mongoose.Schema({
  username: String,
  profilepic: {
    type: String,
    default: "def.jpg",
  },
  email: String,
  mobile: String,
  address: String,
  password: String,
  expiresat: Date,
  otp: {
    type: Number,
    default: '0612',
  },
  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
  ],
  sells: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
  ],
});

userSchema.plugin(plm, { usernameField: "email" });
module.exports = mongoose.model("user", userSchema);
