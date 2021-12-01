const Post = require("../models/posts");
const he = require("he");
const debug = require("debug")("all_posts_ctrl");
var mongoose = require("mongoose");

exports.getAllPosts = function (req, res, next) {
  debug(!!req.query.published);
  // prettier-ignore
  Post.find(req.query.published==undefined ? {} : {"isPublished": true}) 
	  .sort({ updatedAt: "desc" })
	  .limit(!!req.query.limit ? Number(req.query.limit) : null)
	  .exec((err, results) => {
		if (err) {
		  return next(err);
		}
		const decodedResults = results.map((post) => {
		  post.title = he.decode(post.title);
		  post.text = he.decode(post.text);
		});
		return res.json(results);
	  });
};
