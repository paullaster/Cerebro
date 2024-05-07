import express from 'express';
import CustomerController from '../controllers/CustomerController.js';
const useAddressRoutes = express.Router();


useAddressRoutes.get('/address', CustomerController.address.index);
useAddressRoutes.get('/address/:id', CustomerController.address.show);
useAddressRoutes.post('/address', CustomerController.address.store);
useAddressRoutes.put('/address/:id', CustomerController.address.update);
useAddressRoutes.delete('/address/:id', CustomerController.address.destroy);

export default useAddressRoutes;