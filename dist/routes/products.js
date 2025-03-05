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
const Product_1 = __importDefault(require("../models/Product"));
const User_1 = __importDefault(require("../models/User"));
const fs_1 = __importDefault(require("fs"));
const uid2_1 = __importDefault(require("uid2"));
const cloudinary = require("cloudinary").v2;
// Route pour récupérer les derniers produits postés
router.get("/find/:page", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.params.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;
        const products = yield Product_1.default.find({ isSold: false })
            .populate("userID", "username profilePicture -_id")
            .select("-__v")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalProducts = yield Product_1.default.countDocuments();
        const hasMore = totalProducts > page * limit;
        res
            .status(200)
            .json({ result: true, products: products, hasMore: hasMore });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ result: false, error: error.message });
            return;
        }
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour la création d'un produit
router.post("/addItem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, [
            "token",
            "title",
            "description",
            "price",
            "gender",
            "subCategory",
            "brand",
            "size",
            "condition",
            "color",
        ])) {
            res.status(400).json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            const user = yield User_1.default.findOne({ token: req.body.token });
            if (!user) {
                res.status(400).json({ result: false, error: "User not found" });
                return;
            }
            else {
                const productToAdd = new Product_1.default({
                    userID: user._id,
                    title: req.body.title,
                    description: req.body.description,
                    price: req.body.price,
                    gender: req.body.gender,
                    subCategory: req.body.subCategory,
                    brand: req.body.brand,
                    size: req.body.size,
                    condition: req.body.condition,
                    color: req.body.color,
                });
                let photosUrl = [];
                if ((_a = req.files) === null || _a === void 0 ? void 0 : _a.photos) {
                    const photos = (_b = req.files) === null || _b === void 0 ? void 0 : _b.photos;
                    for (const photo of photos) {
                        const photoPath = `./tmp/${(0, uid2_1.default)(16)}.jpg`;
                        photo.mv(photoPath);
                        const resultCloudinary = yield cloudinary.uploader.upload(photoPath, {
                            folder: "VendToutProducts",
                            resource_type: "auto",
                        });
                        fs_1.default.unlinkSync(photoPath);
                        if (resultCloudinary) {
                            photosUrl.push(resultCloudinary.secure_url);
                        }
                        else {
                            res
                                .status(400)
                                .json({ result: false, error: "Error uploading photos" });
                            return;
                        }
                    }
                    productToAdd.photos = photosUrl;
                }
                const productAdded = yield productToAdd.save();
                user.postedProducts.push(productAdded._id);
                yield user.save();
                res.status(200).json({ result: true, productInfos: productAdded });
            }
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ result: false, error: error.message });
            return;
        }
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour la récupération d'un produit selon son id
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.default.findById(req.params.id)
            .populate("userID", "username profilePicture -_id")
            .select("-__v");
        if (!product) {
            res.status(404).json({ result: false, error: "Product not found" });
            return;
        }
        else {
            product.nbViews++;
            yield product.save();
            res.status(200).json({ result: true, productInfos: product });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ result: false, error: error.message });
            return;
        }
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour le like d'un produit
router.post("/like", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, ["token", "id"])) {
            res.status(400).json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            const user = yield User_1.default.findOne({ token: req.body.token });
            if (!user) {
                res.status(400).json({ result: false, error: "User not found" });
                return;
            }
            else {
                const product = yield Product_1.default.findById(req.body.id);
                if (!product) {
                    res.status(404).json({ result: false, error: "Product not found" });
                    return;
                }
                else {
                    if (!user.likedProducts.includes(req.body.id)) {
                        user.likedProducts.push(req.body.id);
                        product.nbLikes++;
                        yield user.save();
                        yield product.save();
                        const _a = user.toObject(), { password, _id, __v } = _a, userInfos = __rest(_a, ["password", "_id", "__v"]);
                        res.status(200).json({
                            result: true,
                            userInfos: userInfos,
                            nbLikes: product.nbLikes,
                        });
                    }
                    else {
                        user.likedProducts = user.likedProducts.filter((id) => id.toString() !== req.body.id);
                        product.nbLikes--;
                        yield user.save();
                        yield product.save();
                        const _b = user.toObject(), { password, _id, __v } = _b, userInfos = __rest(_b, ["password", "_id", "__v"]);
                        res.status(200).json({
                            result: true,
                            userInfos: userInfos,
                            nbLikes: product.nbLikes,
                        });
                    }
                }
            }
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ result: false, error: error.message });
            return;
        }
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour récupérer les produits avec des filtres
router.post("/filteredProducts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { globalSearch, gender, subCategory, size, condition, color, brand } = req.body;
        const query = {};
        if (globalSearch) {
            const wordsToSearch = globalSearch.split(" ");
            query.$and = wordsToSearch.map((word) => ({
                $or: [
                    { title: { $regex: word, $options: "i" } },
                    { description: { $regex: word, $options: "i" } },
                    { brand: { $regex: word, $options: "i" } },
                    { color: { $regex: word, $options: "i" } },
                    { gender: { $regex: word, $options: "i" } },
                    { subCategory: { $regex: word, $options: "i" } },
                ],
            }));
        }
        if (gender) {
            query.gender = { $regex: gender, $options: "i" };
        }
        if (subCategory) {
            query.subCategory = { $regex: subCategory, $options: "i" };
        }
        if (size) {
            query.size = { $regex: size, $options: "i" };
        }
        if (condition) {
            query.condition = { $regex: `^${condition}$`, $options: "i" };
        }
        if (color) {
            query.color = { $regex: color, $options: "i" };
        }
        if (brand) {
            query.brand = { $regex: brand, $options: "i" };
        }
        query.isSold = false;
        const products = yield Product_1.default.find(query)
            .populate("userID", "username profilePicture -_id")
            .select("-__v")
            .sort({ createdAt: -1 });
        res.status(200).json({ result: true, products: products });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ result: false, error: error.message });
            return;
        }
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
// Route pour supprimer un produit
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, ["token"])) {
            res.status(400).json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            const user = yield User_1.default.findOne({ token: req.body.token });
            if (!user) {
                res.status(400).json({ result: false, error: "User not found" });
                return;
            }
            else {
                const userID = user._id.toString();
                const product = yield Product_1.default.findById(req.params.id);
                if (!product) {
                    res.status(404).json({ result: false, error: "Product not found" });
                    return;
                }
                else {
                    if (product.userID.toString() !== userID) {
                        res.status(401).json({ result: false, error: "Unauthorized" });
                        return;
                    }
                    else {
                        // On supprime les photos uploadées sur Cloudinary
                        const photosUrl = product.photos;
                        const deleteImagePromises = photosUrl.map((photoUrl) => {
                            var _a;
                            const publicId = (_a = photoUrl.match(/\/v\d+\/(.+)\.\w+$/)) === null || _a === void 0 ? void 0 : _a[1];
                            return publicId ? cloudinary.uploader.destroy(publicId) : null;
                        });
                        yield Promise.all(deleteImagePromises);
                        // On retire le produit des produits likés des utilisateurs
                        const productDeleted = yield Product_1.default.findByIdAndDelete(req.params.id);
                        if (!productDeleted) {
                            res
                                .status(404)
                                .json({ result: false, error: "Error while deleting product" });
                            return;
                        }
                        else {
                            user.postedProducts = user.postedProducts.filter((id) => id.toString() !== productDeleted._id.toString());
                            yield user.save();
                            yield User_1.default.updateMany({ likedProducts: productDeleted.id }, { $pull: { likedProducts: productDeleted.id } });
                            res.status(200).json({
                                result: true,
                                message: "Product deleted successfully",
                            });
                        }
                    }
                }
            }
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ result: false, error: error.message });
            return;
        }
        res.status(500).json({ result: false, error: "Internal server error" });
    }
}));
exports.default = router;
