import { Router } from "express";
import { createSignature } from "../controllers/mediaController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.post("/signature", createSignature);

export default router;
