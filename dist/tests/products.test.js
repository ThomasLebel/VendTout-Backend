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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const mongoose_1 = __importDefault(require("mongoose"));
// Connexion avant les tests
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connect(process.env.CONNECTION_STRING);
}));
// Déconnexion après les tests
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
}));
// Test pour la route POST /products/addItem
let productId = '';
it("POST /products/addItem", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).post("/products/addItem").send({
        token: 'bpWzzy3hgspPdNaPTq97cMRCsEnUZt3L',
        title: 'Titre du produit',
        description: 'Description du produit',
        price: 100.00,
        gender: 'Homme',
        subCategory: 'Vêtements',
        brand: 'Nike',
        size: 'M',
        condition: 'Neuf',
        color: 'Blanc',
    });
    productId = res.body.productInfos._id;
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.productInfos.title).toBe('Titre du produit');
    expect(res.body.productInfos.description).toBe('Description du produit');
    expect(res.body.productInfos.price).toBe(100.00);
    expect(res.body.productInfos.gender).toBe('Homme');
    expect(res.body.productInfos.subCategory).toBe('Vêtements');
    expect(res.body.productInfos.brand).toBe('Nike');
    expect(res.body.productInfos.size).toBe('M');
    expect(res.body.productInfos.condition).toBe('Neuf');
    expect(res.body.productInfos.color).toBe('Blanc');
}));
// Test pour la route GET /products/:id
it("GET /products/:id", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).get(`/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.productInfos.title).toBe('Titre du produit');
    expect(res.body.productInfos.description).toBe('Description du produit');
    expect(res.body.productInfos.price).toBe(100.00);
    expect(res.body.productInfos.gender).toBe('Homme');
    expect(res.body.productInfos.subCategory).toBe('Vêtements');
    expect(res.body.productInfos.brand).toBe('Nike');
    expect(res.body.productInfos.size).toBe('M');
    expect(res.body.productInfos.condition).toBe('Neuf');
    expect(res.body.productInfos.color).toBe('Blanc');
}));
// Test pour la route POST /products/like
it("POST /products/like", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).post("/products/like").send({
        token: 'bpWzzy3hgspPdNaPTq97cMRCsEnUZt3L',
        id: productId,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.nbLikes).toBe(1);
    expect(res.body.userInfos.likedProducts).toContain(productId);
}));
// Test pour la route POST /products/like avec un produit déjà liké
it("POST /products/like", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).post("/products/like").send({
        token: 'bpWzzy3hgspPdNaPTq97cMRCsEnUZt3L',
        id: productId,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.nbLikes).toBe(0);
    expect(res.body.userInfos.likedProducts).not.toContain(productId);
}));
// Test pour la route DELETE /products/:id
it("DELETE /products/:id", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).delete(`/products/${productId}`).send({
        token: 'bpWzzy3hgspPdNaPTq97cMRCsEnUZt3L',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.message).toBe('Product deleted successfully');
}));
