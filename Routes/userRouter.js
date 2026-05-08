import express from "express";
import { upload } from "../middlewares/multer.js";
import {register,login} from "../controlers/userController.js";

let router = express.Router();

router.post("/register", upload.none(),register)

router.get("/login",upload.none(),login);

export {router as userRoutes};