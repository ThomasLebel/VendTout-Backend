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
 
let token : string;

it("POST /users/signup", async () => {
  const res = await request(app).post("/users/signup").send({
    username: "test",
    email: "test@test.com",
    password: "password123",
  });
  token = res.body.userInfos.token;
  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
  expect(res.body.userInfos.username).toBe("test");
  expect(res.body.userInfos.email).toBe("test@test.com");
  expect(res.body.userInfos.token).toEqual(expect.any(String));
});

it("POST /users/signin", async () => {
  const res = await request(app).post("/users/signin").send({
    identifier: "test",
    password: "password123",
  });
  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
  expect(res.body.userInfos.username).toBe("test");
  expect(res.body.userInfos.email).toBe("test@test.com");
  expect(res.body.userInfos.token).toEqual(expect.any(String));
});


it("PUT /users/profile", async () => {
  const res = await request(app).put("/users/profile").send({
    token: token,
    profilePicture: "test.jpg",
    aboutDescription: "testAboutDescription",
    country: "testCountry",
    city: "testCity",
  });
  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
  expect(res.body.userInfos.profilePicture).toBe("test.jpg");
  expect(res.body.userInfos.aboutDescription).toBe("testAboutDescription");
  expect(res.body.userInfos.country).toBe("testCountry");
  expect(res.body.userInfos.city).toBe("testCity");
});

it("PUT /users/info", async () => {
  const res = await request(app).put("/users/info").send({
    token: token,
    fullName: "testFullName",
    gender: "testGender",
    birthDate: "2020-01-01",
  });
  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
  expect(res.body.userInfos.fullName).toBe("testFullName");
  expect(res.body.userInfos.gender).toBe("testGender");
  expect(res.body.userInfos.birthDate).toBe("2020-01-01T00:00:00.000Z");
});

it("PUT /users/shippingAddress", async () => {
  const res = await request(app).put("/users/shippingAddress").send({
    token: token,
    fullName: "testFullName",
    street: "testStreet",
    city: "testCity",
    zipCode: 12345,
  });
  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
  expect(res.body.userInfos.shippingAddress.fullName).toBe("testFullName");
  expect(res.body.userInfos.shippingAddress.street).toBe("testStreet");
  expect(res.body.userInfos.shippingAddress.city).toBe("testCity");
  expect(res.body.userInfos.shippingAddress.zipCode).toBe(12345);
});

it("DELETE /users/delete", async () => {
  const res = await request(app).delete("/users/delete").send({
    username: "test",
    password: "password123",
  });
  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
  expect(res.body.message).toBe("User deleted");
});

