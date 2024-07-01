const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, lowercase: true, required: true, unique: true },
  password: { type: String, required: true },
  notes: [{ type: Schema.Types.ObjectId, ref: "Note" }],
  createdOn: { type: Date, default: new Date().getTime() },
});

module.exports = mongoose.model("User", userSchema);
