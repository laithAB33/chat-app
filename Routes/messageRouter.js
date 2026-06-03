import express from "express";
import {getAllMessages, newMessages} from "../controllers/messageController.js";
import { verifyToken } from "../middlewares/authentication.js";

let router = express.Router();

router.route("/new").get(verifyToken,newMessages);

router.route("/:userId").get(verifyToken,getAllMessages);


export {router};