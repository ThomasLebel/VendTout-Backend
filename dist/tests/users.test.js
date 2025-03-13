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
let token;
// Test pour la route POST /users/signup
it("POST /users/signup", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).post("/users/signup").send({
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
}));
// Test pour la route POST /users/signin
it("POST /users/signin", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).post("/users/signin").send({
        identifier: "test",
        password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.userInfos.username).toBe("test");
    expect(res.body.userInfos.email).toBe("test@test.com");
    expect(res.body.userInfos.token).toEqual(expect.any(String));
}));
it("PUT /users/profile", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).put("/users/profile").send({
        token: token,
        aboutDescription: "testAboutDescription",
        country: "testCountry",
        city: "testCity",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.userInfos.aboutDescription).toBe("testAboutDescription");
    expect(res.body.userInfos.country).toBe("testCountry");
    expect(res.body.userInfos.city).toBe("testCity");
}));
it("PUT /users/info", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).put("/users/info").send({
        token: token,
        fullName: "testFullName",
        gender: "testGender",
        birthDate: "2020-01-01",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.userInfos.fullName).toBe("testFullName");
    expect(res.body.userInfos.gender).toBe("testGender");
    expect(res.body.userInfos.birthDate).toBe("2020-01-01");
}));
it("PUT /users/shippingAddress", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).put("/users/shippingAddress").send({
        token: token,
        fullName: "testFullName",
        street: "testStreet",
        city: "testCity",
        zipCode: "12345",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.userInfos.shippingAddress.fullName).toBe("testFullName");
    expect(res.body.userInfos.shippingAddress.street).toBe("testStreet");
    expect(res.body.userInfos.shippingAddress.city).toBe("testCity");
    expect(res.body.userInfos.shippingAddress.zipCode).toBe("12345");
}));
it("PUT /users/email", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).put("/users/email").send({
        token: token,
        password: "password123",
        newEmail: "test2@test.com"
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.userInfos.email).toBe("test2@test.com");
}));
it("GET /users/profilePicture/:username", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).get("/users/profilePicture/test");
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.profilePicture).toBe("https://res.cloudinary.com/dkf48p2ah/image/upload/v1739809289/VendToutAvatars/mk8ihczepktfn61qdzh1.jpg");
}));
it("DELETE /users/delete", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).delete("/users/delete").send({
        token: token,
        password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.message).toBe("User deleted");
}));
