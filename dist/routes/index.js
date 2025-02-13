"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Route de base
router.get("/", (req, res) => {
    res.status(200).json({ result: true, message: 'Hello tout fonctionne' });
});
exports.default = router;
