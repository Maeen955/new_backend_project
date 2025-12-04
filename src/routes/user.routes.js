import { Router } from "express";
import { loginUser, logOutUser, registerUser, verifyRefreshToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser);

//private route

router.route("/logout").post(verifyToken, logOutUser)
router.route("/refresh-token").post(verifyRefreshToken);

export default router