import express from 'express';
import customerRoutes from './routes.js';


const customer = new express();


customer.use('/customer', customerRoutes);

export default customer;