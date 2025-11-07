import mongoose from "mongoose";
import { db_Name } from "../constants.js";

const connectDb = async () => {
    try {  
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${db_Name}`);

        console.log(`database connected. Db name ${connectionInstance.connection.host}` );
        
    } catch (error) {
       console.error("❌ MongoDB connection FAILED: ", error);
        process.exit(1)
    }
};

export default connectDb;

