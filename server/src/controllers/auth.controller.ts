import { validationResult } from "express-validator"
import type { Request, Response } from "express"
import type { RequestWithUser } from "../types/index.js"
import { createToken } from "../utils/token.util.js"
import { comparePasswords, createUser, findUserByEmail } from "../services/auth.service.js"

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax" as const,
  maxAge: 1000 * 60 * 60 * 24,
}

function createAuthResponse(res: Response, user: { id: string; name: string; email: string; avatar?: string; createdAt: Date; updatedAt: Date }) {
  const token = createToken({ id: user.id })
  res.cookie("token", token, cookieOptions)
  return res.json({ user })
}

export async function register(req: Request, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { name, email, password } = req.body as { name: string; email: string; password: string }
  const existingUser = await findUserByEmail(email)

  if (existingUser) {
    return res.status(409).json({ message: "Email already exists" })
  }

  const user = await createUser(name, email, password)

  return createAuthResponse(res, {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  })
}

export async function login(req: Request, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body as { email: string; password: string }
  const user = await findUserByEmail(email)

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" })
  }

  const passwordMatches = await comparePasswords(password, user.password)

  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid credentials" })
  }

  return createAuthResponse(res, {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  })
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  })

  return res.json({ message: "Logged out successfully" })
}

export async function me(req: RequestWithUser, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" })
  }

  return res.json({ user: req.user })
}
