const Post = require("../models/posts");
const { body, validationResult } = require("express-validator");
const he = require("he");
const debug = require("debug")("post_ctrl");
var mongoose = require("mongoose");


exports.createPost = [
  body("title")
    .trim()
    .escape()
    .isLength({ min: 1, max: 50 })
    .withMessage("Invalid title"),
  body("text")
    .trim()
    .escape()
    .isLength({ min: 1, max: 5000 })
    .withMessage("Invalid text"),
  body("isPublished").trim().escape().isBoolean(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array().map((err) => err.msg));
    }
    const post = new Post({
      title: req.body.title,
      text: req.body.text,
      author: req.user,
      isPublished: req.body.isPublished,
    });

    post.save((err) => {
      if (err) {
        return res.status(503).json("Failed to save post to database");
      }
      return res.status(200).json("New post created");
    });
  },
];

exports.getPostById = function (req, res, next) {
  Post.findById(req.params.id).exec((err, results) => {
    if (err) {
      return res.status(404).json(err);
    }
    return res.status(200).json(results);
  });
};

exports.deletePost = function (req, res, next) {
  Post.findByIdAndRemove(req.params.id).exec((err, results) => {
    if (err) {
      return res.status(404).json(err);
    }
    return res.status(200).json(results);
  });
};

exports.updatePost = [
  body("title")
    .trim()
    .escape()
    .isLength({ min: 1, max: 50 })
    .withMessage("Invalid title"),
  body("text")
    .trim()
    .escape()
    .isLength({ min: 1, max: 500 })
    .withMessage("Invalid text"),
  body("isPublished").trim().escape().isBoolean(),

  function (req, res, next) {
    debug(String(req.params.id));
    Post.findById(req.params.id).exec((err, results) => {
      if (err) {
        return next(err);
      }
      if (!!results.length) {
        return res.status(404).json("Can't find post in database.");
      } else {
        debug(results);
        const updatedPost = {
          title: req.body.title || results.title,
          text: req.body.text || results.text,
          author: req.body.author || results.author,
          isPublished: req.body.isPublished || results.isPublished,
        };
        Post.findByIdAndUpdate(
          req.params.id,
          updatedPost,
          {},
          (err, results) => {
            if (err) {
              return res.status(404).json(err);
            }

            return res.status(200).json(updatedPost);
          }
        );
      }
    });
  },
];
