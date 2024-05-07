import express from 'express';
import UserController from '../app/http/controllers/UserController.js';
const useUserRoutes = express.Router();


useUserRoutes.get('/user', UserController.index);
useUserRoutes.get('/user/:id', UserController.show);
useUserRoutes.post('/user', UserController.store);
useUserRoutes.put('/user/:id', UserController.update);
useUserRoutes.delete('/user/:id', UserController.destroy);

export default useUserRoutes;