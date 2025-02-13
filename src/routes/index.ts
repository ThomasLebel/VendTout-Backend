import { Router, Request, Response } from "express";

const router = Router();

// Route de base
router.get("/", (req: Request, res: Response) => {
 res.status(200).json({result: true, message: 'Hello tout fonctionne'})
});

export default router;