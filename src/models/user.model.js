import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true
        },
           fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            required: true
        },
        coverImage: {
            type: String, //cloudnary url
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "password must required"]
        },
        refreshtoken: {
            type: String
        }

    },
    {
        timestamps: true
    }
);


userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next()
});


userSchema.methods.isPasswordCorrect = async function(pasword) {
    return await bcrypt.compare(pasword, this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn: process.env.ACCESS_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken =  function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFREASH_TOKEN_KEY,
        {
            expiresIn: process.env.REFREASH_EXPIRY
        }
    )
}



export const User =  mongoose.model("User", userSchema)