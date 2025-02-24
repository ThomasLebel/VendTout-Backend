import request from "supertest";
import app from "../app";
import mongoose from "mongoose";

// Connexion avant les tests
beforeAll(async () => {
    await mongoose.connect(process.env.CONNECTION_STRING as string);
  });

  // Déconnexion après les tests
afterAll(async () => {
    await mongoose.disconnect();
  });

// Test pour la route POST /products/addItem

let productId = '';

it("POST /products/addItem", async () => {
    const res = await request(app).post("/products/addItem").send({
        token : 'bpWzzy3hgspPdNaPTq97cMRCsEnUZt3L',
        title : 'Titre du produit',
        description : 'Description du produit',
        price : 100.00,
        gender : 'Homme',
        subCategory : 'Vêtements',
        brand : 'Nike',
        size : 'M',
        condition : 'Neuf',
        color : 'Blanc',
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
});

// Test pour la route GET /products/:id

it("GET /products/:id", async () => {
    const res = await request(app).get(`/products/${productId}`);
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
});

// Test pour la route POST /products/like

it("POST /products/like", async () => {
    const res = await request(app).post("/products/like").send({
        token : 'bpWzzy3hgspPdNaPTq97cMRCsEnUZt3L',
        id : productId,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.nbLikes).toBe(1);
    expect(res.body.userInfos.likedProducts).toContain(productId);
});

// Test pour la route POST /products/like avec un produit déjà liké

it("POST /products/like", async () => {
    const res = await request(app).post("/products/like").send({
        token : 'bpWzzy3hgspPdNaPTq97cMRCsEnUZt3L',
        id : productId,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.nbLikes).toBe(0);
    expect(res.body.userInfos.likedProducts).not.toContain(productId);
});

// Test pour la route DELETE /products/:id

it("DELETE /products/:id", async () => {
    const res = await request(app).delete(`/products/${productId}`).send({
        token : 'bpWzzy3hgspPdNaPTq97cMRCsEnUZt3L',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.message).toBe('Product deleted successfully');
});
