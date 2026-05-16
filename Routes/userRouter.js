import express from "express";
import { upload } from "../middlewares/multer.js";
import {register,login,refreshToken} from "../controlers/userController.js";
import { verifyToken } from "../middlewares/authentication.js";

let router = express.Router();

router.route("/register").post(upload.none(),register);
router.route("/login").get(upload.none(),login);

router.route('/refresh').patch(verifyToken,refreshToken);

export {router as userRoutes};