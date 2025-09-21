/*import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"



//app config
const app = express()
const port = 4000

//middleware
app.use(express.json())
app.use(cors())


//db connection
connectDB();


app.get("/", (req,res)=>{
    res.send("API Working")
})

app.listen(port, ()=>{
    console.log(`Server Started on http://localhost:${port}`)
})*/

import express from "express";
//import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

//app.use("/api/notes", notesRoutes);

app.listen(PORT, () => {
    console.log("Server is running on PORT:", PORT);
});
