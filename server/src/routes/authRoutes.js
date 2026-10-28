import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  googleLogin,
  login,
  logout,
  logoutAll,
  refresh,
  register,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateGoogleLogin, validateLogin, validateRegister } from "../middleware/validateAuth.js";

const router = Router();

const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many authentication attempts" } },
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.post("/register", credentialLimiter, validateRegister, register);
router.post("/login", credentialLimiter, validateLogin, login);
router.post("/google", credentialLimiter, validateGoogleLogin, googleLogin);
router.post("/refresh", refreshLimiter, refresh);
router.post("/logout", logout);
router.post("/logout-all", requireAuth, logoutAll);

export default router;
