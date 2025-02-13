"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
const checkBody_1 = __importDefault(require("../modules/checkBody"));
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uid2_1 = __importDefault(require("uid2"));
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, ["username", "email", "password"])) {
            res
                .status(400)
                .json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            // On vérifie si l'utilisateur existe déjà avec ce username
            let userAlreadyExists = yield User_1.default.findOne({ username: req.body.username });
            if (userAlreadyExists) {
                res.status(400).json({ result: false, error: "Username already exists" });
                return;
            }
            else {
                // On vérifie si l'utilisateur existe déjà avec cet email
                userAlreadyExists = yield User_1.default.findOne({ email: req.body.email });
                if (userAlreadyExists) {
                    res.status(400).json({ result: false, error: "Email already exists" });
                    return;
                }
                else {
                    // On génère un token unique
                    const token = (0, uid2_1.default)(32);
                    // On génère un mot de passe hashé
                    const hash = bcryptjs_1.default.hashSync(req.body.password, 10);
                    // On crée un nouvel utilisateur
                    const newUser = new User_1.default({
                        username: req.body.username,
                        email: req.body.email,
                        password: hash,
                        token: token
                    });
                    const userAdded = yield newUser.save();
                    if (userAdded) {
                        res.status(200).json({ result: true, userInfos: userAdded });
                    }
                    else {
                        res.status(400).json({ result: false, error: "User not created" });
                    }
                }
            }
        }
    }
    catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
}));
exports.default = router;
