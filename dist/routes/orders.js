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
const Product_1 = __importDefault(require("../models/Product"));
const User_1 = __importDefault(require("../models/User"));
const Order_1 = __importDefault(require("../models/Order"));
const checkBody_1 = __importDefault(require("../modules/checkBody"));
// Route pour ajouter une nouvelle commande
router.post("/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, [
            "productID",
            "buyerUsername",
            "sellerUsername",
            "totalPrice",
            "sellerPrice",
            "paymentMethod",
        ])) {
            res.status(400).json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            // On vérifie si les utilisateurs existent
            const buyer = yield User_1.default.findOne({
                username: req.body.buyerUsername,
            });
            const seller = yield User_1.default.findOne({
                username: req.body.sellerUsername,
            });
            if (!buyer || !seller) {
                res.status(400).json({ result: false, error: "User not found" });
                return;
            }
            else {
                // On vérifie si le produit existe
                const product = yield Product_1.default.findById(req.body.productID);
                if (!product) {
                    res.status(400).json({ result: false, error: "Product not found" });
                    return;
                }
                else {
                    // On créer la nouvelle commande
                    const orderToAdd = new Order_1.default({
                        buyer: buyer._id,
                        seller: seller._id,
                        product: product._id,
                        totalPrice: req.body.totalPrice,
                        sellerPrice: req.body.sellerPrice,
                        paymentMethod: req.body.paymentMethod,
                        status: "En attente",
                    });
                    yield orderToAdd.save();
                    product.isSold = true;
                    yield product.save();
                    const chatID = [req.body.buyerUsername, req.body.sellerUsername].sort().join("_") +
                        "_" +
                        product._id;
                    res
                        .status(200)
                        .json({
                        result: true,
                        chatID: chatID,
                        productID: product._id,
                        productTitle: product.title,
                        buyerUsername: buyer.username,
                        buyerProfilePicture: buyer.profilePicture,
                        sellerUsername: seller.username,
                        sellerProfilePicture: seller.profilePicture,
                    });
                }
            }
        }
    }
    catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
        return;
    }
}));
// Route pour mettre le statut de la commande sur "Envoyé"
router.put("/productSent", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, ["productID", "userToken"])) {
            res.status(400).json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            const user = yield User_1.default.findOne({
                token: req.body.userToken,
            });
            if (!user) {
                res.status(400).json({ result: false, error: "User not found" });
                return;
            }
            else {
                const order = yield Order_1.default.findOne({
                    product: req.body.productID,
                    seller: user._id,
                });
                if (!order) {
                    res.status(400).json({ result: false, error: "Product not found" });
                    return;
                }
                else {
                    order.status = "Envoyé";
                    yield order.save();
                    res.status(200).json({ result: true });
                }
            }
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ result: false, error: "Internal server error" });
        return;
    }
}));
// Route pour mettre le statut de la commande sur "Terminé"
router.put("/productReceived", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // On vérifie que le corps de la requête contient les champs requis
        if (!(0, checkBody_1.default)(req.body, ["productID", "userToken"])) {
            res.status(400).json({ result: false, error: "Missing or empty fields" });
            return;
        }
        else {
            const user = yield User_1.default.findOne({
                token: req.body.userToken,
            });
            if (!user) {
                res.status(400).json({ result: false, error: "User not found" });
                return;
            }
            else {
                const order = yield Order_1.default.findOne({
                    product: req.body.productID,
                    buyer: user._id,
                });
                if (!order) {
                    res.status(400).json({ result: false, error: "Product not found" });
                    return;
                }
                else {
                    order.status = "Terminé";
                    yield order.save();
                    res.status(200).json({ result: true });
                }
            }
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ result: false, error: "Internal server error" });
        return;
    }
}));
// Route pour récupérer les commandes d'un utilisateur
router.get("/:usertoken", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usertoken = req.params.usertoken;
        const user = yield User_1.default.findOne({ token: usertoken });
        if (!user) {
            res.status(400).json({ result: false, error: "User not found" });
            return;
        }
        else {
            const orders = yield Order_1.default.find({ buyer: user._id })
                .populate("product", "title photos")
                .populate("seller", "username -_id")
                .select("-buyer -_id -__v");
            const sales = yield Order_1.default.find({ seller: user._id })
                .populate("product", "title photos")
                .populate("buyer", "username -_id")
                .select("-seller -_id -__v");
            res.status(200).json({ result: true, orders: orders, sales: sales });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ result: false, error: "Internal server error" });
        return;
    }
}));
exports.default = router;
