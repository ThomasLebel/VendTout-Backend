"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkBody = (body, requiredFields) => {
    let isValid = true;
    for (const field of requiredFields) {
        if (!body[field] || body[field] === "") {
            isValid = false;
            break;
        }
    }
    return isValid;
};
exports.default = checkBody;
