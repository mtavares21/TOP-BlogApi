const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user_ctrl");
// POST create user
router.post("/signup", userCtrl.createUser);

// POST logIn
router.post("/login", userCtrl.logIn);

module.exports = router;
