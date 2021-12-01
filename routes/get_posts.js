const express = require("express");
const router = express.Router();
const allPostsCtrl = require("../controllers/all_posts_ctrl");

//GET all posts
router.get("/", allPostsCtrl.getAllPosts);

module.exports = router;