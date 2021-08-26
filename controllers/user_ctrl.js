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
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: "Something is not right",
        user: { user_id: user._id, user_name: user.name },
      });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }

      // generate a signed son web token with the contents of user object and return it in the response

      const token = jwt.sign(JSON.stringify(user), process.env.JWT);
      return res.json({ user_id: user._id, user_name: user.username, token });
    });
  })(req, res);
};
