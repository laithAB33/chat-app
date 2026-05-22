import express from "express";
import { upload } from "../middlewares/multer.js";
import {register,login,refreshToken,update,addAvatar} from "../controlers/userController.js";
import { verifyToken } from "../middlewares/authentication.js";
import { userUpdateValidate, userRegisterValidate } from "../middlewares/validate.js";


let router = express.Router();

router.route("/register").post(upload.none(),userRegisterValidate,register);

router.route("/login").get(upload.none(),login);

router.route('/refresh').patch(verifyToken,refreshToken);

router.route('/').patch(verifyToken,upload.single('image'),userUpdateValidate,update);

// router.route('/avatar').post(verifyToken,upload.single('image'),addAvatar);

export {router as userRoutes};