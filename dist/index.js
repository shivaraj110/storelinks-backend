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
require('dotenv').config();
const resend_1 = require("resend");
const express_1 = __importDefault(require("express"));
const resend = new resend_1.Resend('re_123456789');
const app = (0, express_1.default)();
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield resend.emails.send({
            from: 'Shivaraj <onboarding@storelinks.tech>',
            to: ['realenzimo@gmail.com'],
            subject: 'Hello World',
            html: '<strong>it works!</strong>',
        });
        res.status(200).json(data);
    }
    catch (error) {
        res.status(400).json(error);
    }
}));
app.listen(3000, () => {
    if (!process.env.RESEND_API_KEY) {
        throw `Abort: You need to define RESEND_API_KEY in the .env file.`;
    }
    console.log('Listening on http://localhost:3000');
});
