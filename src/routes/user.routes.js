import { Router } from "express";
import { getCurrentAccount, loginUser, logOutUser, registerUser, resetPassword, updateAccountDetails, updateAvatarImage, updateCoverImage, verifyRefreshToken } from "../controllers/user.controller.js";
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
router.route("/reset-pass").post(verifyToken, resetPassword);
router.route("/get-user").get(verifyToken, getCurrentAccount);
router.route("/update-user").patch(verifyToken, updateAccountDetails);
router.route("/update-cover").patch(
    upload.single("coverImage"),
    verifyToken,
    updateCoverImage
);
router.route("/update-avatar").patch(
    upload.single("avatar"),
    verifyToken,
    updateAvatarImage
)

export default router