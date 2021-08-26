const Post = require("../models/posts");
const { body, validationResult } = require("express-validator");
const he = require("he");

exports.getAllPosts = function (req, res, next) {
  Post.find({}).exec((err, results) => {
    if (err) {
      return next(err);
    }
    const decodedResults = results.map((post) => {
      post.title = he.decode(post.title);
      post.text = he.decode(post.text);
    });
    return res.json(JSON.stringify(results));
  });
};

exports.createPost = [
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array().map((err) => err.msg));
    }
    const post = new Post({
      title: req.body.title,
      text: req.body.text,
      author: req.user,
      isPublished: req.body.published,
    });

    post.save((err) => {
      if (err) {
        return res.status(503).json("Failed to save post to database");
      }
      res.status(200).json("New post created");
    });
  },
];

exports.getPostById = function (req, res, next) {
  Post.findById(req.params.id).exec((err, results) => {
    if (err) {
      return res.status(404).json(err);
    }

    res.status(200).json(results);
  });
};
