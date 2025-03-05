"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("./models/connection");
const index_1 = __importDefault(require("./routes/index"));
const users_1 = __importDefault(require("./routes/users"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const app = (0, express_1.default)();
// Connexion à la base de données
(0, connection_1.connectDatabase)().catch(console.error);
// Configuration de fileUpload
const fileUpload = require("express-fileupload");
app.use(fileUpload());
// Configuration de CORS
app.use((0, cors_1.default)());
// Configuration des middlewares
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
// app.use(express.static(path.join(__dirname, "public")));
// Routes
app.use("/", index_1.default);
app.use("/users", users_1.default);
app.use("/products", products_1.default);
app.use("/orders", orders_1.default);
exports.default = app;
