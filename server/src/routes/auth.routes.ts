import { Router } from "express"
import { body } from "express-validator"
import {
  login,
  logout,
  me,
  register,
  getProfileStats,
  changePassword,
} from "../controllers/auth.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = Router()

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  register
)

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
)

router.post("/logout", logout)
router.get("/me", authMiddleware, me)
router.get("/profile/stats", authMiddleware, getProfileStats)
router.put("/profile/password", authMiddleware, changePassword)

export default router
