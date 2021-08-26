const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: Schema.Types.String },
  password: { type: Schema.Types.String },
  allow: { type: Schema.Types.String },
});

module.exports = mongoose.model("User", UserSchema);
