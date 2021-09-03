require("dotenv").config();
const User = require("../models/users");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
require("passport-local");
const passportJWT = require("passport-jwt");
const jwt = require("jsonwebtoken");

exports.createUser = [
  body("username").escape().isEmail().trim(),
  // password must be at least 5 chars long
  body("password")
    .escape()
    .isLength({ min: 5 })
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false,
    })
    .withMessage(
      "Password must contain 8 characters, uppercase and lowercase, and at least a symbol and a number "
    )
    .trim(),
  (req, res, next) => {
    User.find({ username: req.body.username }).exec((err, results) => {
      if (err) {
        return res.status(503).json("Problem accessing the database");
      }
      if (!!results.length) {
        return res.status(400).json("Username already exists");
      }
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res
            .status(400)
            .json({ errors: errors.array().map((err) => err.msg) });
        }

        const user = new User({
          username: req.body.username,
          password: hashedPassword,
          allow: req.body.username === process.env.ADMIN ? "WRITE" : "READ",
        });

        user.save(function (err) {
          if (err) {
            return next(err);
          }
          res.status(200).json(`User: ${req.body.username} created`);
        });
      });
    });
  },
];

exports.logIn = function (req, res, next) {
  passport.authenticate(
    "local",
    {
      successRedirect: "/",
      failureRedirect: "/",
    },
    (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          message: "Something is not right",
        });
      }

      req.login(user, { session: true }, (err) => {
        if (err) {
          res.status(404).json(err);
        }

        // generate json web token with the contents of user object and return it in the response
        if (user.allow === "WRITE") {
          const token = jwt.sign(JSON.stringify(user), process.env.JWT);
          return res.status(200).json({
            user_id: user._id,
            username: user.username,
            allow: user.allow,
            token,
          });
        } else {
          return res.status(200).json({
            user_id: user._id,
            username: user.username,
            allow: user.allow,
          });
        }
      });
    }
  )(req, res);
};
