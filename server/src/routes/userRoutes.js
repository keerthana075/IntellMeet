import { Router } from "express";
import { getMe, updateMe } from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.get("/me", getMe);
router.patch("/me", updateMe);

export default router;
