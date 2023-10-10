var express = require("express");
var router = express.Router();
var userModel = require("../models/users");
var productModel = require("../models/products");
var mailer = require("../nodemailer");
const passport = require("passport");
var multer = require("multer");

const localStrategy = require("passport-local");

passport.use(
  new localStrategy(
    {
      usernameField: "email",
    },
    userModel.authenticate()
  )
);

function fileFilter(req, file, cb) {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("file extension is invalid"));
  }
}

const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/profilepics");
  },
  filename: function (req, file, cb) {
    const fn = Math.floor(Math.random() * 10000) + "-sj-" + Date.now() + "-" + file.originalname;
    cb(null, fn);
  },
});

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/productpics");
  },
  filename: function (req, file, cb) {
    const fn =
      Math.floor(Math.random() * 10000) +
      "-sj-" +
      Date.now() +
      "-" +
      file.originalname;
    cb(null, fn);
  },
});

const profilePicUpload = multer({ storage: storage1, fileFilter: fileFilter });
const productPicUpload = multer({ storage: storage2, fileFilter: fileFilter });

router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/register", function (req, res, next) {
  res.render("register");
});

router.post( "/register", profilePicUpload.single("profilepic"), function (req, res, next) {
    let userData = new userModel({
      username: req.body.username,
      profilepic: req.file.filename,
      email: req.body.email,
      mobile: req.body.mobile,
      address: req.body.address,
    });

    userModel
      .register(userData, req.body.password)
      .then(function () {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/home");
        });
      })
      .catch(function () {
        res.redirect("/login");
      });
  }
);

router.get("/checkexistence/:useremail", function (req, res) {
  userModel.findOne({ email: req.params.useremail }).then(function (user) {
    res.json({ user });
  });
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.get("/forgetpassword", function (req, res) {
  res.render("forgetpassword");
});

router.post("/verification", function (req, res) {
  userModel
    .findOne({ email: req.body.forgetemail })
    .then(function (founduser) {
      var currdate = new Date();
      var after = new Date(currdate.getTime() + 60 * 60 * 24 * 1000);
      var otp = Math.floor(Math.random() * 10000);
      founduser.expiresat = after;
      founduser.otp = otp;
      founduser.save();
      mailer(founduser.email, otp);
      res.render("enterotp", { founduser });
    })
    .catch(function () {
      res.send("user doesn't exist");
    });
});

router.post("/otpchecked/:useremail", async function (req, res) {
  var user = await userModel.findOne({ email: req.params.useremail });
  if (user.otp === Number(req.body.otp)) {
    res.send("OTP is verified, you can now set your new password");
  } else {
    res.send("OTP is wrong");
  }
});

router.post( "/login", passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/register",
  }),
  function (req, res, next) {}
);

router.get("/logout", isLoggedIn, function (req, res, next) {
  req.logOut(function (err) {
    if (err) throw err;
    res.redirect("/login");
  });
});

router.get("/home", isLoggedIn, async function (req, res) {
  var user = await userModel.findOne({ email: req.session.passport.user });
  var products = await productModel.find().populate("owner");
  res.render("home", { user, products });
});

router.get("/addtocart/:productid", isLoggedIn, async function (req, res) {
  var loggedInUser = await userModel.findOne({
    email: req.session.passport.user,
  });
  loggedInUser.cart.push(req.params.productid);
  loggedInUser.save();
  res.json({ cart: loggedInUser.cart.length });
});

router.get("/cart", isLoggedIn, async function (req, res) {
  var loggedInUser = await userModel.findOne({
    email: req.session.passport.user,
  });

  loggedInUser.populate("cart").then(function (data) {
    var sum = 0;
    data.cart.forEach(function (price) {
      sum += Number(price.productprice);
    });
    res.render("cart", { products: data.cart, total: sum });
  });
});

router.get("/profile", isLoggedIn, function (req, res) {
  userModel
    .findOne({ email: req.session.passport.user })
    .then(function (foundUser) {
      res.render("profile", { user: foundUser });
    });
});

router.get("/sellingaccount", isLoggedIn, async function (req, res) {
  var loggedInUser = await userModel.findOne({
    email: req.session.passport.user,
  });
  productModel.find({ owner: loggedInUser._id }).then(function (products) {
    res.render("sellingaccount", { products });
  });
});

router.post( "/addproduct", isLoggedIn, productPicUpload.single("productpic"), function (req, res) {
    userModel
      .findOne({ email: req.session.passport.user })
      .then(function (user) {
        productModel
          .create({
            productname: req.body.productname,
            productprice: req.body.productprice,
            discount: req.body.discount,
            productpic: req.file.filename,
            productdetails: req.body.productdetails,
            owner: user._id,
          })
          .then(function (product) {
            user.sells.push(product._id);
            user.save();
            res.redirect(req.headers.referer);
          });
      });
  }
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
