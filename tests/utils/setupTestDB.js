import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../../models/categoryModel.js";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import { hashPassword } from "../../helpers/authHelper.js";
import orderModel from "../../models/orderModel.js";
import productModel from "../../models/productModel.js";
import userModel from "../../models/userModel.js";

// Populate the database
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sampleUserData = [{
    _id: new mongoose.Types.ObjectId(),
    name: "admin",
    email: "admin@admin.com",
    password: await hashPassword("admin"),
    phone: "12345678",
    address: "admin",
    answer: "admin",
    role: 1
}, {
    _id: new mongoose.Types.ObjectId(),
    name: "user",
    email: "user@user.com",
    password: await hashPassword("user"),
    phone: "12345678",
    address: "user",
    answer: "user",
    role: 0
}];

const categoryData = fs.readFileSync(path.join(__dirname, "../sample_data/test.categories.json"), "utf-8");
const orderData = fs.readFileSync(path.join(__dirname, "../sample_data/test.orders.json"), "utf-8");
const productData = fs.readFileSync(path.join(__dirname, "../sample_data/test.products.json"), "utf-8");
// const userData = fs.readFileSync(path.join(__dirname, "../sample_data/test.categories.json"), "utf-8");



const setupTestDB = async () => {
    try {
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        const conn = await mongoose.connect(mongoUri);

        const categories = JSON.parse(categoryData).map(category => ({
            _id: new mongoose.Types.ObjectId(category._id.$oid),
            name: category.name,
            slug: category.slug
        }));

        // Insert Data into Category Model
        await categoryModel.insertMany(categories);

        const orders = JSON.parse(orderData).map(order => ({
            _id: new mongoose.Types.ObjectId(order._id.$oid),
            products: order.products.map(p => new mongoose.Types.ObjectId(p.$oid)),
            payment: order.payment,
            buyer: new mongoose.Types.ObjectId(order.buyer.$oid),
            status: order.status,
            createdAt: new Date(order.createdAt.$date),
            updatedAt: new Date(order.updatedAt.$date),
        }));

        // Insert Data into Order Model
        await orderModel.insertMany(orders);


        const products = JSON.parse(productData).map(product => ({
            _id: new mongoose.Types.ObjectId(product._id.$oid),
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            category: new mongoose.Types.ObjectId(product.category.$oid),
            quantity: product.quantity,
            sold: product.sold,
            photo: {
                data: Buffer.from(product.photo.data.$binary.base64, "base64"),
                contentType: product.photo.contentType,
            },
        }));

        // Insert Data into Product Model
        await productModel.insertMany(products);
        
        // Insert Data into User Model       
        await userModel.insertMany(sampleUserData);

        console.log(`Connected To Test Mongodb Memory Server ${conn.connection.host}`.bgMagenta.white);


    } catch (error) {
        console.log(`Error in Mongodb ${error}`);
    }
};

export default setupTestDB;