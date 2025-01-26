import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
    UserID: string;
    HyperCoins: number;
    Bio: string;
    Title: string;
    Privacy: boolean;
    Admin: boolean;
    Theme: string;
    Language: string;
}

const userSchema = new Schema<IUser>({
    UserID: { type: String, required: true },
    HyperCoins: { type: Number, default: 100 },
    Bio: { type: String, default: "Nuovo Utente" },
    Title: { type: String, default: "" },
    Privacy: { type: Boolean, default: false },
    Admin: { type: Boolean, default: false }, 
    Theme: { type: String, default: "Default" },
    Language: { type: String, default: "" }
});

export default mongoose.model<IUser>('userSchema', userSchema);
