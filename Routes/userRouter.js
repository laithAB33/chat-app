import express from "express";
import { upload } from "../middlewares/multer.js";
import {register,login,refreshToken,update,addAvatar, searchUser, changePrivacySettings,logout} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authentication.js";
import { userUpdateValidate, userRegisterValidate, userUpdatePrivacySettingsValidate } from "../middlewares/validate.js";


let router = express.Router();

router.route("/register").post(upload.none(),userRegisterValidate,register);

router.route("/login").post(upload.none(),login);

router.route('/refresh').patch(refreshToken);

router.route('/').patch(verifyToken,upload.single('image'),userUpdateValidate,update)
                 .delete(logout);

router.route('/:userName').get(verifyToken,searchUser);

router.route('/avatar').post(verifyToken,upload.single('image'),addAvatar);

router.route('/privacySettings').patch(verifyToken,upload.none(),userUpdatePrivacySettingsValidate,changePrivacySettings);



export {router as userRoutes};