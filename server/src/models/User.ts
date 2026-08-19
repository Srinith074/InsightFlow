import mongoose from "mongoose"

export interface UserDocument extends mongoose.Document {
  name: string
  email: string
  password: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String },
  },
  {
    timestamps: true,
  }
)

userSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete returnedObject.password
    delete returnedObject.__v
    return returnedObject
  },
})

const User = mongoose.model<UserDocument>("User", userSchema)
export default User
