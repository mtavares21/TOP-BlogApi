const express = require("express");
const router = express.Router();
const postCtrl = require("../controllers/post_ctrl");

// GET post
router.get("/:id", postCtrl.getPostById);

// CREATE post
router.post("/", postCtrl.createPost);

// DELETE post
router.delete("/", postCtrl.deletePost);

// UPDATE post
router.put("/", postCtrl.updatePost);

//GET all posts
router.get("/", postCtrl.getAllPosts);

module.exports = router;
