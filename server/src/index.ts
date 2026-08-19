import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const { default: app } = await import("./app.js");
const { connectDatabase } = await import("./config/database.js");

const PORT = process.env.PORT ?? "4000";

await connectDatabase();

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});