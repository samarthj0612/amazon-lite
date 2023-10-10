var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/amazon");

var productSchema = mongoose.Schema({
  productname: String,
  productprice: Number,
  discount: Number,
  productpic: {
    type: String,
    default: "def.jpg",
  },
  productdetails: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

module.exports = mongoose.model("product", productSchema);
