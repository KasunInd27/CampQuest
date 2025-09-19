import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://camp_quest_db_user:CampQuest12345@cluster0.mie160i.mongodb.net/camp-quest').then(()=>console.log("DB Connected"));
}
2