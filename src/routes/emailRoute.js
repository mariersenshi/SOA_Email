import { sendEmail } from "../controllers/emailController.js";
import express from "express";

const router = express.Router();
router.post('/send', sendEmail);

export default router;