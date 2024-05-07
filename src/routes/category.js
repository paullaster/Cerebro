import express from 'express';
import CategoryController from '../app/http/controllers/CategoryController.js';
const useCategoryroute = express.Router();

useCategoryroute.get('/category', CategoryController.index);
useCategoryroute.get('/category/:id', CategoryController.show);
useCategoryroute.post('/category', CategoryController.store);
useCategoryroute.put('/category/:id', CategoryController.update);
useCategoryroute.delete('/category/:id', CategoryController.destroy);

export default useCategoryroute;