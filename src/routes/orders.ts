import express, { query, Request, Response } from "express";
var router = express.Router();

import Product, { IProduct } from "../models/Product";
import User, { IUser } from "../models/User";
import Order, { IOrder } from "../models/Order";

import checkBody from "../modules/checkBody";

// Route pour ajouter une nouvelle commande
router.post("/add", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis
    if (
      !checkBody(req.body, [
        "productID",
        "buyerUsername",
        "sellerUsername",
        "totalPrice",
        "sellerPrice",
        "paymentMethod",
      ])
    ) {
      res.status(400).json({ result: false, error: "Missing or empty fields" });
      return;
    } else {
      // On vérifie si les utilisateurs existent
      const buyer: IUser | null = await User.findOne({
        username: req.body.buyerUsername,
      });
      const seller: IUser | null = await User.findOne({
        username: req.body.sellerUsername,
      });
      if (!buyer || !seller) {
        res.status(400).json({ result: false, error: "User not found" });
        return;
      } else {
        // On vérifie si le produit existe
        const product: IProduct | null = await Product.findById(
          req.body.productID
        );
        if (!product) {
          res.status(400).json({ result: false, error: "Product not found" });
          return;
        } else {
          // On créer la nouvelle commande
          const orderToAdd: IOrder = new Order({
            buyer: buyer._id,
            seller: seller._id,
            product: product._id,
            totalPrice: req.body.totalPrice,
            sellerPrice: req.body.sellerPrice,
            paymentMethod: req.body.paymentMethod,
            status: "En attente",
          });
          await orderToAdd.save();
          product.isSold = true
          await product.save()
          const chatID =
            [req.body.buyerUsername, req.body.sellerUsername].sort().join("_") +
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
  } catch (error) {
    res.status(500).json({ result: false, error: "Internal server error" });
    return;
  }
});

// Route pour mettre le statut de la commande sur "Envoyé"
router.put("/productSent", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis
    if (!checkBody(req.body, ["productID", "userToken"])) {
      res.status(400).json({ result: false, error: "Missing or empty fields" });
      return;
    } else {
      const user: IUser | null = await User.findOne({
        token: req.body.userToken,
      });
      if (!user) {
        res.status(400).json({ result: false, error: "User not found" });
        return;
      } else {
        const order: IOrder | null = await Order.findOne({
          product: req.body.productID,
          seller: user._id,
        });
        if (!order) {
          res.status(400).json({ result: false, error: "Product not found" });
          return;
        } else {
          order.status = "Envoyé";
          await order.save();
          res.status(200).json({ result: true });
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "Internal server error" });
    return;
  }
});

// Route pour mettre le statut de la commande sur "Terminé"
router.put("/productReceived", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis
    if (!checkBody(req.body, ["productID", "userToken"])) {
      res.status(400).json({ result: false, error: "Missing or empty fields" });
      return;
    } else {
      const user: IUser | null = await User.findOne({
        token: req.body.userToken,
      });
      if (!user) {
        res.status(400).json({ result: false, error: "User not found" });
        return;
      } else {
        const order: IOrder | null = await Order.findOne({
          product: req.body.productID,
          buyer: user._id,
        });
        if (!order) {
          res.status(400).json({ result: false, error: "Product not found" });
          return;
        } else {
          order.status = "Terminé";
          await order.save();
          res.status(200).json({ result: true });
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "Internal server error" });
    return;
  }
});

// Route pour récupérer les commandes d'un utilisateur
router.get("/:usertoken", async (req: Request, res: Response) => {
  try {
    const usertoken = req.params.usertoken;
    const user: IUser | null = await User.findOne({ token: usertoken });
    if (!user) {
      res.status(400).json({ result: false, error: "User not found" });
      return;
    } else {
      const orders: IOrder[] | null = await Order.find({ buyer: user._id })
        .populate("product", "title photos")
        .populate("seller", "username -_id")
        .select("-buyer -_id -__v");
      const sales: IOrder[] | null = await Order.find({ seller: user._id })
        .populate("product", "title photos")
        .populate("buyer", "username -_id")
        .select("-seller -_id -__v");
      res.status(200).json({ result: true, orders: orders, sales: sales });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "Internal server error" });
    return;
  }
});

export default router;
