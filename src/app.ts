import express from "express";
import "express-async-errors";
import { appRoutes } from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import cors from "cors"
import path from "path";


const app = express();

app.use(cors({
    origin: '*' //incluir vercel do front aqui
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    "/files",
    express.static(path.resolve(__dirname, "..", "tmp", "uploads"))
  );
appRoutes(app);

app.use(errorMiddleware);

export default app;
