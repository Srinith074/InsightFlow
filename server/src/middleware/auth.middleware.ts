import type { NextFunction, Response } from "express"
import type { RequestWithUser } from "../types/index.js"
import User from "../models/User.js"
import { verifyToken } from "../utils/token.util.js"

export async function authMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
    const token = req.cookies?.token
    console.log("Cookies:", req.cookies);
    console.log("Token:", req.cookies?.token);
  if (!token) {
    return res.status(401).json({ message: "Authentication required" })
  }

  try {
    const payload = verifyToken(token)
    const user = await User.findById(payload.id).select("-password")

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" })
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid authentication token" })
  }
}
