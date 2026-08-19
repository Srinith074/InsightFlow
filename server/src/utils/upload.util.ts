import fs from "fs"
import path from "path"
import multer from "multer"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadFolder = path.join(__dirname, "..", "..", "uploads")

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadFolder),
  filename: (_req, file, callback) => {
    const timestamp = Date.now()
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")
    callback(null, `${timestamp}-${safeName}`)
  },
})

export const datasetUpload = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const allowed = [".csv", ".xls", ".xlsx"]
    callback(null, allowed.includes(extension))
  },
})
