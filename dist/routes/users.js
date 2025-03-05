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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
const fs_1 = __importDefault(require("fs"));
const cloudinary = require("cloudinary").v2;
// Route pour l'inscription d'un utilisateur
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, ["username", "email", "password"])) {
            res.status(400).json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            // On vérifie si l'utilisateur existe déjà avec ce username
            let userAlreadyExists = yield User_1.default.findOne({
                username: req.body.username,
            });
            if (userAlreadyExists) {
                res
                    .status(400)
                    .json({ result: false, error: "Username already exists" });
                return;
            }
            else {
                // On vérifie si l'utilisateur existe déjà avec cet email
                userAlreadyExists = yield User_1.default.findOne({ email: req.body.email });
                if (userAlreadyExists) {
                    res
                        .status(400)
                        .json({ result: false, error: "Email already exists" });
                    return;
                }
                else {
                    // On génère un token unique
                    const token = (0, uid2_1.default)(32);
                    // On génère un mot de passe hashé
                    const hash = bcryptjs_1.default.hashSync(req.body.password, 10);
                    // On crée un nouvel utilisateur
                    const newUser = new User_1.default({
                        username: req.body.username.toLowerCase(),
                        email: req.body.email.toLowerCase(),
                        password: hash,
                        token: token,
                    });
                    const userAdded = yield newUser.save();
                    if (userAdded) {
                        const _a = userAdded.toObject(), { password, _id, __v } = _a, userInfos = __rest(_a, ["password", "_id", "__v"]);
                        res.status(200).json({ result: true, userInfos });
                    }
                    else {
                        res.status(400).json({ result: false, error: "User not created" });
                    }
                }
            }
        }
    }
    catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour la connexion d'un utilisateur
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, ["identifier", "password"])) {
            res.status(400).json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            // On vérifie si l'utilisateur existe
            let user = yield User_1.default.findOne({
                username: req.body.identifier.toLowerCase(),
            });
            if (!user) {
                user = yield User_1.default.findOne({ email: req.body.identifier });
                if (!user) {
                    res.status(400).json({ result: false, error: "User not found" });
                    return;
                }
                else {
                    // On vérifie si le mot de passe est correct
                    if (!bcryptjs_1.default.compareSync(req.body.password, user.password)) {
                        res.status(400).json({ result: false, error: "Invalid password" });
                        return;
                    }
                    else {
                        const _a = user.toObject(), { password, _id, __v } = _a, userInfos = __rest(_a, ["password", "_id", "__v"]);
                        res.status(200).json({ result: true, userInfos });
                    }
                }
            }
            else {
                // On vérifie si le mot de passe est correct
                if (!bcryptjs_1.default.compareSync(req.body.password, user.password)) {
                    res.status(400).json({ result: false, error: "Invalid password" });
                    return;
                }
                else {
                    const _b = user.toObject(), { password, _id, __v } = _b, userInfos = __rest(_b, ["password", "_id", "__v"]);
                    res.status(200).json({ result: true, userInfos });
                }
            }
        }
    }
    catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour rechercher les utilisateurs selon un pseudo
router.get("/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find({
            username: { $regex: req.params.username, $options: "i" },
        }).select("username profilePicture -_id");
        res.status(200).json({ result: true, users: users });
    }
    catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour récupérer la photo de profil d'un utilisateur selon son pseudo
router.get("/profilePicture/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        User_1.default.findOne({ username: req.params.username })
            .select("profilePicture")
            .then((user) => {
            if (user) {
                res
                    .status(200)
                    .json({ result: true, profilePicture: user.profilePicture });
            }
            else {
                res.status(400).json({ result: false, error: "User not found" });
            }
        });
    }
    catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour la modification du profil d'un utilisateur
router.put("/profile", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, ["token", "aboutDescription", "country", "city"])) {
            res.status(400).json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            // On vérifie si l'utilisateur existe
            const user = yield User_1.default.findOne({ token: req.body.token });
            if (!user) {
                res.status(400).json({ result: false, error: "User not found" });
                return;
            }
            else {
                // On modifie le profil de l'utilisateur
                user.aboutDescription = req.body.aboutDescription;
                user.country = req.body.country;
                user.city = req.body.city;
                // On vérifie si l'utilisateur a uploadé une image de profil
                if ((_a = req.files) === null || _a === void 0 ? void 0 : _a.profilePicture) {
                    // On supprime l'ancien avatar uploadé sur Cloudinary
                    if (user.profilePicture !==
                        "https://res.cloudinary.com/dkf48p2ah/image/upload/v1739809289/VendToutAvatars/mk8ihczepktfn61qdzh1.jpg") {
                        const publicId = (_b = user.profilePicture.match(/\/v\d+\/(.+)\.\w+$/)) === null || _b === void 0 ? void 0 : _b[1];
                        yield cloudinary.uploader.destroy(publicId);
                    }
                    // On upload le nouvel avatar sur cloudinary
                    const photoPath = `./tmp/${(0, uid2_1.default)(16)}.jpg`;
                    const profilePicture = req.files.profilePicture;
                    profilePicture.mv(photoPath);
                    const resultCloudinary = yield cloudinary.uploader.upload(photoPath, {
                        folder: "VendToutAvatars",
                        resource_type: "auto",
                    });
                    fs_1.default.unlinkSync(photoPath);
                    if (resultCloudinary) {
                        user.profilePicture = resultCloudinary.secure_url;
                    }
                    else {
                        res.status(400).json({
                            result: false,
                            error: "Error uploading profile picture",
                        });
                        return;
                    }
                }
                yield user.save();
                const _c = user.toObject(), { password, _id, __v } = _c, userInfos = __rest(_c, ["password", "_id", "__v"]);
                res.status(200).json({ result: true, userInfos });
            }
        }
    }
    catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour la modification des information personnelles d'un utilisateur
router.put("/info", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // On vérifie si l'utilisateur existe
        const user = yield User_1.default.findOne({ token: req.body.token });
        if (!user) {
            res.status(400).json({ result: false, error: "User not found" });
            return;
        }
        else {
            // On modifie les informations personnelles de l'utilisateur
            user.fullName = req.body.fullName;
            user.gender = req.body.gender;
            user.birthDate = req.body.birthDate;
            yield user.save();
            const _a = user.toObject(), { password, _id, __v } = _a, userInfos = __rest(_a, ["password", "_id", "__v"]);
            res.status(200).json({ result: true, userInfos });
        }
    }
    catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour la modification de l'adresse de livraison d'un utilisateur
router.put("/shippingAddress", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, ["token", "fullName", "street", "city", "zipCode"])) {
            res.status(400).json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            // On vérifie si l'utilisateur existe
            const user = yield User_1.default.findOne({ token: req.body.token });
            if (!user) {
                res.status(400).json({ result: false, error: "User not found" });
                return;
            }
            else {
                // On modifie l'adresse de livraison de l'utilisateur
                const newShippingAddress = {
                    fullName: req.body.fullName,
                    street: req.body.street,
                    city: req.body.city,
                    zipCode: req.body.zipCode,
                };
                user.shippingAddress = newShippingAddress;
                yield user.save();
                const _a = user.toObject(), { password, _id, __v } = _a, userInfos = __rest(_a, ["password", "_id", "__v"]);
                res.status(200).json({ result: true, userInfos });
            }
        }
    }
    catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour la modification du mot de passe d'un utilisateur
router.put("/password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, ["token", "oldPassword", "newPassword"])) {
            res.status(400).json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            // On vérifie si l'utilisateur existe
            const user = yield User_1.default.findOne({ token: req.body.token });
            if (!user) {
                res.status(400).json({ result: false, error: "User not found" });
                return;
            }
            else {
                // On modifie le mot de passe de l'utilisateur
                if (!bcryptjs_1.default.compareSync(req.body.oldPassword, user.password)) {
                    res
                        .status(400)
                        .json({ result: false, error: "Invalid old password" });
                    return;
                }
                else {
                    user.password = req.body.newPassword;
                    yield user.save();
                    res.status(200).json({ result: true, message: "Password updated" });
                }
            }
        }
    }
    catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour la modification de l'email d'un utilisateur
router.put("/email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, ["token", "password", "newEmail"])) {
            res.status(400).json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            // On vérifie si l'utilisateur existe
            const user = yield User_1.default.findOne({ token: req.body.token });
            if (!user) {
                res.status(400).json({ result: false, error: "User not found" });
                return;
            }
            else {
                // On vérifie si le mot de passe est correct
                if (!bcryptjs_1.default.compareSync(req.body.password, user.password)) {
                    res.status(400).json({ result: false, error: "Invalid password" });
                    return;
                }
                else {
                    // On modifie l'email de l'utilisateur
                    user.email = req.body.newEmail;
                    yield user.save();
                    const _a = user.toObject(), { password, _id, __v } = _a, userInfos = __rest(_a, ["password", "_id", "__v"]);
                    res.status(200).json({ result: true, userInfos });
                }
            }
        }
    }
    catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour récupérer les articles favoris
router.get("/favourites/:userToken", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        User_1.default.findOne({ token: req.params.userToken })
            .populate({
            path: "likedProducts",
            select: "-__v",
            populate: { path: "userID", select: "username profilePicture -_id" },
        })
            .then((user) => {
            if (!user) {
                res.status(400).json({ result: false, error: "User not found" });
            }
            else {
                res.status(200).json({ result: true, products: user.likedProducts });
            }
        });
    }
    catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour récupérer les produits postés par un utilisateur
router.get("/postedProducts/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({ username: req.params.username }).populate({
            path: "postedProducts",
            select: "-__v",
            populate: { path: "userID", select: "username profilePicture -_id" },
        });
        if (!user) {
            res.status(400).json({ result: false, error: "User not found" });
        }
        else {
            const userInfos = {
                username: user.username,
                profilePicture: user.profilePicture,
                country: user.country,
                city: user.city,
                aboutDescription: user.aboutDescription,
            };
            const sortedPostedProducts = user.postedProducts.sort((a, b) => b.createdAt - a.createdAt);
            res.status(200).json({
                result: true,
                products: sortedPostedProducts,
                userInfos: userInfos,
            });
        }
    }
    catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour la suppresion d'un utilisateur
router.delete("/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, ["token", "password"])) {
            res.status(400).json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            // On vérifie si l'utilisateur existe
            const user = yield User_1.default.findOne({ token: req.body.token });
            if (!user) {
                res.status(400).json({ result: false, error: "User not found" });
                return;
            }
            else {
                // On vérifie si le mot de passe est correct
                if (!bcryptjs_1.default.compareSync(req.body.password, user.password)) {
                    res.status(400).json({ result: false, error: "Invalid password" });
                    return;
                }
                else {
                    // On supprime l'avatar uploadé sur Cloudinary
                    if (user.profilePicture !==
                        "https://res.cloudinary.com/dkf48p2ah/image/upload/v1739809289/VendToutAvatars/mk8ihczepktfn61qdzh1.jpg") {
                        const publicId = (_a = user.profilePicture.match(/\/v\d+\/(.+)\.\w+$/)) === null || _a === void 0 ? void 0 : _a[1];
                        yield cloudinary.uploader.destroy(publicId);
                    }
                    // On supprime l'utilisateur
                    yield User_1.default.deleteOne({ token: req.body.token });
                    res.status(200).json({ result: true, message: "User deleted" });
                }
            }
        }
    }
    catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
exports.default = router;
