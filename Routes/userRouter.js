import express from "express";
import { upload } from "../middlewares/multer.js";
import {register,login,refreshToken,update,addAvatar, searchUser, changePrivacySettings} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authentication.js";
import { userUpdateValidate, userRegisterValidate, userUpdatePrivacySettingsValidate } from "../middlewares/validate.js";


let router = express.Router();

router.route("/register").post(upload.none(),userRegisterValidate,register);

router.route("/login/:userName/:password").get(upload.none(),login);

router.route('/refresh').patch(refreshToken);

router.route('/').patch(verifyToken,upload.single('image'),userUpdateValidate,update)
                 .get(verifyToken,searchUser);

router.route('/avatar').post(verifyToken,upload.single('image'),addAvatar);

router.route('/privacySettings').patch(verifyToken,upload.none(),userUpdatePrivacySettingsValidate,changePrivacySettings);

export {router as userRoutes};