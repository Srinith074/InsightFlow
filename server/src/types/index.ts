import type { Request } from "express"
import type { Express } from "express";

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface RequestWithUser extends Request {
  user?: AuthUser
  file?: Express.Multer.File
}
