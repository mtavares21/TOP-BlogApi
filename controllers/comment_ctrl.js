const Comment = require("../models/comments");
const { body, validationResult } = require("express-validator");
const he = require("he");
const debug = require("debug")("comment_ctrl");
var mongoose = require("mongoose");

exports.getComments = function (req, res, next) {
  debug(req.query.limit);
  const query = () => {
    if (!!req.query.id) {
      return { _id: req.query.id };
    } else if (!!req.query.postid) {
      return { post: req.query.postid };
    } else return {};
  };
  Comment.find(query())
    .limit(!!req.query.limit ? Number(req.query.limit) : null)
    .populate("author")
    .populate("post")
    .exec((err, results) => {
      if (err) {
        return next(err);
      }
      const decodedResults = results.map((Comment) => {
        Comment.text = he.decode(Comment.text);
      });
      return res.json(results);
    });
};

exports.createComment = [
  body("text")
    .trim()
    .escape()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Invalid text"),

  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array().map((err) => err.msg));
    }
    const comment = new Comment({
      text: req.body.text,
      author: req.user,
      post: req.query.postid,
    });

    comment.save((err) => {
      if (err) {
        return res.status(503).json("Failed to save Comment to database");
      }
      return res.status(200).json("New Comment created");
    });
  },
];

exports.deleteComment = function (req, res, next) {
  Comment
    .findById(req.params.id)
    .populate("author")
    .exec((err, results) => {
      if (err || !results) {
        res.status(404).json(err);
        return next();
      }
      if (results.author.id !== req.user.id && req.user.allow !== "WRITE"){
        return res.status(403).json("User does not have permission do delete this comment.")
      }
      Comment
      .findByIdAndRemove(req.params.id)
      .exec( (err, results) => {
        if(err){
          return res.status(404).json(err);
        }
        return res.status(200).json(`Comment with id = ${req.params.id} was deleted.`)
      })
    });
  };

exports.updateComment = [
  body("text")
    .trim()
    .escape()
    .isLength({ min: 1, max: 500 })
    .withMessage("Invalid text"),

  function (req, res, next) {
    debug(String(req.params.id));
    Comment.findById(req.params.id).exec((err, results) => {
      if (err) {
        return next(err);
      }
      if (!results) {
        return res.status(404).json("Can't find comment in database.");
      } else {
        debug(results);
        const updatedComment = {
          text: req.body.text || results.text,
          author: req.body.author || results.author,
          post: req.body.post || results.post,
        };
        Comment.findByIdAndUpdate(
          req.params.id,
          updatedComment,
          {},
          (err, results) => {
            if (err) {
              return res.status(404).json(err);
            }

            return res.status(200).json(updatedComment);
          }
        );
      }
    });
  },
];
