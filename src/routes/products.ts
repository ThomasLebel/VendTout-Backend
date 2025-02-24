import express, { Request, Response } from "express";
var router = express.Router();
import mongoose from "mongoose";
import checkBody from "../modules/checkBody";
import Product, { IProduct } from "../models/Product";
import User, { IUser } from "../models/User";
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import uid2 from "uid2";

const cloudinary = require("cloudinary").v2;

// Route pour récupérer les derniers produits postés
router.get('/find/:page', async (req: Request, res: Response) => {
  try{
    const page: number = parseInt(req.params.page) || 1;
    const limit : number = 15;
    const skip : number = (page - 1) * limit;
    const products: IProduct[] = await Product.find()
      .populate("userID", "username profilePicture -_id")
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalProducts: number = await Product.countDocuments();
    const hasMore: boolean = totalProducts > page * limit;
    res.status(200).json({ result: true, products: products, hasMore: hasMore });
  } catch (error) {
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Route pour la création d'un produit

router.post("/addItem", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis
    if (
      !checkBody(req.body, [
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
      ])
    ) {
      res.status(400).json({ result: false, error: "Missing or empty fields" });
      return;
    } else {
      const user: IUser | null = await User.findOne({ token: req.body.token });
      if (!user) {
        res.status(400).json({ result: false, error: "User not found" });
        return;
      } else {
        const productToAdd: IProduct = new Product({
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
        let photosUrl: string[] = [];
        if (req.files?.photos) {
          const photos: UploadedFile[] = req.files?.photos as UploadedFile[];
          for (const photo of photos) {
            const photoPath: string = `./tmp/${uid2(16)}.jpg`;
            photo.mv(photoPath);
            const resultCloudinary = await cloudinary.uploader.upload(
              photoPath,
              {
                folder: "VendToutProducts",
                resource_type: "auto",
              }
            );
            fs.unlinkSync(photoPath);
            if (resultCloudinary) {
              photosUrl.push(resultCloudinary.secure_url);
            } else {
              res
                .status(400)
                .json({ result: false, error: "Error uploading photos" });
              return;
            }
          }
          productToAdd.photos = photosUrl;
        }
        const productAdded: IProduct = await productToAdd.save();
        user.postedProducts.push(productAdded._id);
        await user.save();
        res.status(200).json({ result: true, productInfos: productAdded });
      }
    }
  } catch (error) {
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});


// Route pour la récupération d'un produit

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product: IProduct | null = await Product.findById(req.params.id)
      .populate("userID", "username profilePicture -_id")
      .select("-__v");
    if (!product) {
      res.status(404).json({ result: false, error: "Product not found" });
      return;
    } else {
      product.nbViews++;
      await product.save();
      res.status(200).json({ result: true, productInfos: product });
    }
  } catch (error) {
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Route pour le like d'un produit

router.post("/like", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis
    if (!checkBody(req.body, ["token", "id"])) {
      res.status(400).json({ result: false, error: "Missing or empty fields" });
      return;
    } else {
      const user: IUser | null = await User.findOne({ token: req.body.token });
      if (!user) {
        res.status(400).json({ result: false, error: "User not found" });
        return;
      } else {
        const product: IProduct | null = await Product.findById(req.body.id);
        if (!product) {
          res.status(404).json({ result: false, error: "Product not found" });
          return;
        } else {
          if (!user.likedProducts.includes(req.body.id)) {
            user.likedProducts.push(req.body.id);
            product.nbLikes++;
            await user.save();
            await product.save();
            const { password, _id, __v, ...userInfos } = user.toObject();
            res.status(200).json({
              result: true,
              userInfos: userInfos,
              nbLikes: product.nbLikes,
            });
          } else {
            user.likedProducts = user.likedProducts.filter(
              (id) => id.toString() !== req.body.id
            );
            product.nbLikes--;
            await user.save();
            await product.save();
            const { password, _id, __v, ...userInfos } = user.toObject();
            res.status(200).json({
              result: true,
              userInfos: userInfos,
              nbLikes: product.nbLikes,
            });
          }
        }
      }
    }
  } catch (error) {
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Route pour supprimer un produit

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis
    if (!checkBody(req.body, ["token"])) {
      res.status(400).json({ result: false, error: "Missing or empty fields" });
      return;
    } else {
      const user: IUser | null = await User.findOne({ token: req.body.token });
      if (!user) {
        res.status(400).json({ result: false, error: "User not found" });
        return;
      } else {
        const userID: string = user._id.toString();
        const product: IProduct | null = await Product.findById(req.params.id);
        if (!product) {
          res.status(404).json({ result: false, error: "Product not found" });
          return;
        } else {
          if (product.userID.toString() !== userID) {
            res.status(401).json({ result: false, error: "Unauthorized" });
            return;
          } else {
            // On retire le produit des produits likés des utilisateurs
            const productDeleted: IProduct | null =
              await Product.findByIdAndDelete(req.params.id);
            if (!productDeleted) {
              res
                .status(404)
                .json({ result: false, error: "Error while deleting product" });
              return;
            } else {
              user.postedProducts = user.postedProducts.filter(
                (id) => id.toString() !== productDeleted._id.toString()
              );
              await user.save();
              await User.updateMany(
                { likedProducts: productDeleted.id },
                { $pull: { likedProducts: productDeleted.id } }
              );
              res
                .status(200)
                .json({
                  result: true,
                  message: "Product deleted successfully",
                });
            }
          }
        }
      }
    }
  } catch (error) {
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

export default router;
