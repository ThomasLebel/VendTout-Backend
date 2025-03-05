import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import productsRouter from "./routes/products";
import ordersRouter from "./routes/orders";

const app = express();

// Configuration de fileUpload
const fileUpload = require('express-fileupload');
app.use(fileUpload());

// Configuration de CORS
app.use(cors());


// Configuration des middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use('/orders', ordersRouter)

export default app;