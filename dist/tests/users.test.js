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
// Test pour la route POST /users/signup
// Connexion avant les tests
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connect(process.env.CONNECTION_STRING);
}));
// Déconnexion après les tests
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
}));
it("POST /users/signup", () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, supertest_1.default)(app_1.default).post("/users/signup").send({
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
}));
