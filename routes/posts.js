const express = require("express");
const router = express.Router();
const postCtrl = require("../controllers/post_ctrl");

// GET post
router.get("/:id", postCtrl.getPostById);

// DELETE post
router.delete("/:id", postCtrl.deletePost);

// UPDATE post
router.put("/:id", postCtrl.updatePost);

// CREATE post
router.post("/", postCtrl.createPost);

//GET all posts
router.get("/", postCtrl.getAllPosts);

module.exports = router;
