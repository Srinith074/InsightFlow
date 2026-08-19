import type { ErrorRequestHandler } from "express"

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error)
  res.status(error.status ?? 500).json({ message: error.message ?? "Internal server error" })
}
