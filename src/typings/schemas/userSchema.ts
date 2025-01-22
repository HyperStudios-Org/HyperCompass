import mongoose, { Schema, Model} from "mongoose";

let userSchema = new Schema({
    UserID: String,
    HyperCoins: Number,
    Bio: String,
    Title: String,
    Privacy: Boolean,
    Admin: Boolean,
    Theme: String,
    Language: String,
});

export default mongoose.model('UserSchema', userSchema);
