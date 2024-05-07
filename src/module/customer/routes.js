import useAddressRoutes from "./routes/address.js";
import express from "express";
const customerRoutes = express.Router();


customerRoutes.use(useAddressRoutes);
export default customerRoutes;
