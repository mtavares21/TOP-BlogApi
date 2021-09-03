const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostsSchema = new Schema(
  {
    title: { type: Schema.Types.String },
    text: { type: Schema.Types.String },
    // Let's put a author option, one day I might decide to allow other users to post stuff
    author: { type: Schema.Types.ObjectId, ref: "User" },
    isPublished: { type: Schema.Types.Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostsSchema);
