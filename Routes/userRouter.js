import express from "express";
import { upload } from "../middlewares/multer.js";
import {register,login,refreshToken,update} from "../controlers/userController.js";
import { verifyToken } from "../middlewares/authentication.js";
import { userUpdateValidate } from "../middlewares/validate.js";


let router = express.Router();

router.route("/register").post(upload.none(),register);
router.route("/login").get(upload.none(),login);
router.route('/refresh').patch(verifyToken,refreshToken);

router.route('/').patch(verifyToken,upload.single('image'),userUpdateValidate,update);


export {router as userRoutes};