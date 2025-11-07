import dotenv from "dotenv"
import connectDb from "./db/index.js"
import { app } from "./app.js";
dotenv.config()

const port = process.env.PORT || 8000

connectDb()
.then(() => {
    app.listen(port, () => {
        console.log(`app listening on port ${port}`);
    })
})
.catch((err) => {
    console.log("database connection error", err);
    
})