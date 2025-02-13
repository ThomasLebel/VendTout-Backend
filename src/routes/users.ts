import express, { Request, Response } from "express";
var router = express.Router();
import checkBody from "../modules/checkBody";
import User, { IUser } from "../models/User";
import bcryptjs from "bcryptjs";
import uid2 from "uid2";

router.post("/signup", async (req: Request, res: Response) => {
  try {
    // On vérifie que le corps de la requête contient les champs requis
    if (!checkBody(req.body, ["username", "email", "password"])) {
      res
        .status(400)
        .json({ result: false, error: "Missing or empty fields" });
        return;
    } else {
        // On vérifie si l'utilisateur existe déjà avec ce username
        let userAlreadyExists : IUser | null = await User.findOne({username : req.body.username});
        if (userAlreadyExists) {
            res.status(400).json({result : false, error : "Username already exists"});
            return;
        } else {
            // On vérifie si l'utilisateur existe déjà avec cet email
            userAlreadyExists = await User.findOne({email : req.body.email});
            if (userAlreadyExists) {
                res.status(400).json({result : false, error : "Email already exists"});
                return;
            } else {
                // On génère un token unique
                const token = uid2(32);
                // On génère un mot de passe hashé
                const hash = bcryptjs.hashSync(req.body.password, 10);
                // On crée un nouvel utilisateur
                const newUser = new User({
                    username : req.body.username,
                    email : req.body.email,
                    password : hash,
                    token : token
                });
                const userAdded = await newUser.save();
                if (userAdded) {
                    res.status(200).json({result : true, userInfos : userAdded});
                } else {
                    res.status(400).json({result : false, error : "User not created"});
                }
            }
        }
    }
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message });
  }
});

export default router;
