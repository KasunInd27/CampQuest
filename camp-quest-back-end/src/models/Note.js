import mangoose from "mongoose";

//1st step: Create a schema
//2nd step: Create a model based off of that schema
//3rd step: Export the model

const noteSchema = new mangoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,       
        required: true,
    },
}, {
    timestamps: true,   //createdAt, updatedAt
}); 
const Note = mangoose.model("Note", noteSchema);
export default Note;