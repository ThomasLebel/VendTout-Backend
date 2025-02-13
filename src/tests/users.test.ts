import request from "supertest";
import app from "../app";
import mongoose from "mongoose";


// Test pour la route POST /users/signup

// Connexion avant les tests
beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION_STRING as string);
});

// Déconnexion après les tests
afterAll(async () => {
  await mongoose.disconnect();
});


it("POST /users/signup", async () => {
  const res = await request(app).post("/users/signup").send({
    username: "test",
    email: "test@test.com",
    password: "password123",
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
  expect(res.body.userInfos.username).toBe("test");
  expect(res.body.userInfos.email).toBe("test@test.com");
  expect(res.body.userInfos.password).toEqual(expect.any(String));
  expect(res.body.userInfos.token).toEqual(expect.any(String));
});
