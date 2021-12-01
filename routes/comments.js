const express = require("express");
const router = express.Router();
const commentCtrl = require("../controllers/comment_ctrl");

// DELETE comment
router.delete("/:id", commentCtrl.deleteComment);

// UPDATE comment
router.put("/:id", commentCtrl.updateComment);

// CREATE comment
router.post("/", commentCtrl.createComment);

//GET by post comments
//router.get("/", commentCtrl.getComments);
router.get("/", commentCtrl.getComments);

module.exports = router;
