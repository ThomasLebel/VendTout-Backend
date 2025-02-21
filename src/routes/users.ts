import express, { Request, Response } from "express";
var router = express.Router();
import checkBody from "../modules/checkBody";
import User, { IUser } from "../models/User";
import bcryptjs from "bcryptjs";
import uid2 from "uid2";
import { UploadedFile } from "express-fileupload";
import fs from "fs";

const cloudinary = require('cloudinary').v2;


// Route pour l'inscription d'un utilisateur

router.post("/signup", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis
    if (!checkBody(req.body, ["username", "email", "password"])) {
      res.status(400).json({ result: false, error: "Missing or empty fields" });
      return;
    } else {
      // On vérifie si l'utilisateur existe déjà avec ce username
      let userAlreadyExists: IUser | null = await User.findOne({
        username: req.body.username,
      });
      if (userAlreadyExists) {
        res
          .status(400)
          .json({ result: false, error: "Username already exists" });
        return;
      } else {
        // On vérifie si l'utilisateur existe déjà avec cet email
        userAlreadyExists = await User.findOne({ email: req.body.email });
        if (userAlreadyExists) {
          res
            .status(400)
            .json({ result: false, error: "Email already exists" });
          return;
        } else {
          // On génère un token unique
          const token = uid2(32);
          // On génère un mot de passe hashé
          const hash = bcryptjs.hashSync(req.body.password, 10);
          // On crée un nouvel utilisateur
          const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            token: token,
          });
          const userAdded = await newUser.save();
          if (userAdded) {
            const { password, _id, __v, ...userInfos } = userAdded.toObject();
            res.status(200).json({ result: true, userInfos });
          } else {
            res.status(400).json({ result: false, error: "User not created" });
          }
        }
      }
    }
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour la connexion d'un utilisateur

router.post("/signin", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis
    if (!checkBody(req.body, ["identifier", "password"])) {
      res.status(400).json({ result: false, error: "Missing or empty fields" });
      return;
    } else {
      // On vérifie si l'utilisateur existe
      let user: IUser | null = await User.findOne({
        username: req.body.identifier,
      });
      if (!user) {
        user = await User.findOne({ email: req.body.identifier });
        if (!user) {
          res.status(400).json({ result: false, error: "User not found" });
          return;
        } else {
          // On vérifie si le mot de passe est correct
          if (!bcryptjs.compareSync(req.body.password, user.password)) {
            res.status(400).json({ result: false, error: "Invalid password" });
            return;
          } else {
            const { password, _id, __v, ...userInfos } = user.toObject();
            res.status(200).json({ result: true, userInfos });
          }
        }
      } else {
        // On vérifie si le mot de passe est correct
        if (!bcryptjs.compareSync(req.body.password, user.password)) {
          res.status(400).json({ result: false, error: "Invalid password" });
          return;
        } else {
          const { password, _id, __v, ...userInfos } = user.toObject();
          res.status(200).json({ result: true, userInfos });
        }
      }
    }
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour la modification du profil d'un utilisateur

router.put("/profile", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis
    if (
      !checkBody(req.body, [
        "token",
        "aboutDescription",
        "country",
        "city",
      ])
    ) {
      res.status(400).json({ result: false, error: "Missing or empty fields" });
      return;
    } else {
      // On vérifie si l'utilisateur existe
      const user: IUser | null = await User.findOne({ token: req.body.token });
      if (!user) {
        res.status(400).json({ result: false, error: "User not found" });
        return;
      } else {
        // On modifie le profil de l'utilisateur
        user.aboutDescription = req.body.aboutDescription;
        user.country = req.body.country;
        user.city = req.body.city;

        // On vérifie si l'utilisateur a uploadé une image de profil
        if (req.files?.profilePicture){
          const photoPath : string = `./tmp/${uid2(16)}.jpg`;
          const profilePicture = req.files.profilePicture as UploadedFile;
          profilePicture.mv(photoPath);
          const resultCloudinary = await cloudinary.uploader.upload(photoPath,{
            folder : "VendToutAvatars",
            resource_type : "auto",
          })
          fs.unlinkSync(photoPath);
          if (resultCloudinary){
            user.profilePicture = resultCloudinary.secure_url;
          } else {
            res.status(400).json({ result: false, error: "Error uploading profile picture" });
            return;
          }
        }
        await user.save();
        const { password, _id, __v, ...userInfos } = user.toObject();
        res.status(200).json({ result: true, userInfos });
      }
    }
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour la modification des information personnelles d'un utilisateur

router.put("/info", async (req: Request, res: Response) => {
  try {
    // On vérifie si l'utilisateur existe
    const user: IUser | null = await User.findOne({ token: req.body.token });
    if (!user) {
      res.status(400).json({ result: false, error: "User not found" });
      return;
    } else {
      // On modifie les informations personnelles de l'utilisateur
      user.fullName = req.body.fullName;
      user.gender = req.body.gender;
      user.birthDate = req.body.birthDate;
      await user.save();
      const { password, _id, __v, ...userInfos } = user.toObject();
      res.status(200).json({ result: true, userInfos });
    }
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour la modification de l'adresse de livraison d'un utilisateur

router.put("/shippingAddress", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis
    if (
      !checkBody(req.body, ["token", "fullName", "street", "city", "zipCode"])
    ) {
      res.status(400).json({ result: false, error: "Missing or empty fields" });
      return;
    } else {
      // On vérifie si l'utilisateur existe
      const user: IUser | null = await User.findOne({ token: req.body.token });
      if (!user) {
        res.status(400).json({ result: false, error: "User not found" });
        return;
      } else {
        // On modifie l'adresse de livraison de l'utilisateur
        const newShippingAddress: {
          fullName: string;
          street: string;
          city: string;
          zipCode: string;
        } = {
          fullName: req.body.fullName,
          street: req.body.street,
          city: req.body.city,
          zipCode: req.body.zipCode,
        };
        user.shippingAddress = newShippingAddress;
        await user.save();
        const { password, _id, __v, ...userInfos } = user.toObject();
        res.status(200).json({ result: true, userInfos });
      }
    }
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour la modification du mot de passe d'un utilisateur

router.put("/password", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis
    if (!checkBody(req.body, ["token", "oldPassword", "newPassword"])) {
      res.status(400).json({ result: false, error: "Missing or empty fields" });
      return;
    } else {
      // On vérifie si l'utilisateur existe
      const user: IUser | null = await User.findOne({ token: req.body.token });
      if (!user) {
        res.status(400).json({ result: false, error: "User not found" });
        return;
      } else {
        // On modifie le mot de passe de l'utilisateur
        if (!bcryptjs.compareSync(req.body.oldPassword, user.password)) {
          res
            .status(400)
            .json({ result: false, error: "Invalid old password" });
          return;
        } else {
          user.password = req.body.newPassword;
          await user.save();
          res.status(200).json({ result: true, message: "Password updated" });
        }
      }
    }
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour la modification de l'email d'un utilisateur

router.put("/email", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis 
    if (!checkBody(req.body, ["token", "password", "newEmail"])) {
      res.status(400).json({ result: false, error: "Missing or empty fields" });
      return;
    } else {
      // On vérifie si l'utilisateur existe
      const user: IUser | null = await User.findOne({ token: req.body.token });
      if (!user) {
        res.status(400).json({ result: false, error: "User not found" });
        return;
      } else {
        // On vérifie si le mot de passe est correct
        if (!bcryptjs.compareSync(req.body.password, user.password)) {
          res.status(400).json({ result: false, error: "Invalid password" });
          return;
        } else {
          // On modifie l'email de l'utilisateur
          user.email = req.body.newEmail;
          await user.save();
          const { password, _id, __v, ...userInfos } = user.toObject();
          res.status(200).json({ result: true, userInfos });
        }
      }
    }
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour la suppresion d'un utilisateur

router.delete("/delete", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis
    if (!checkBody(req.body, ["token", "password"])) {
      res.status(400).json({ result: false, error: "Missing or empty fields" });
      return;
    } else {
      // On vérifie si l'utilisateur existe
      const user = await User.findOne({ token: req.body.token });
      if (!user) {
        res.status(400).json({ result: false, error: "User not found" });
        return;
      } else {
        // On vérifie si le mot de passe est correct
        if (!bcryptjs.compareSync(req.body.password, user.password)) {
          res.status(400).json({ result: false, error: "Invalid password" });
          return;
        } else {
          // On supprime l'utilisateur
          await User.deleteOne({ token: req.body.token });
          res.status(200).json({ result: true, message: "User deleted" });
        }
      }
    }
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message });
  }
});

export default router;
