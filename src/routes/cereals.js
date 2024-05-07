import express from 'express';
import CerealsController from '../app/http/controllers/CerealsController.js';
const useCerealsRoute = express.Router();

useCerealsRoute.get('/cereals', CerealsController.index);
useCerealsRoute.get('/cereals/:id', CerealsController.show);
useCerealsRoute.post('/cereals', CerealsController.store);
useCerealsRoute.put('/cereals/:id', CerealsController.update);
useCerealsRoute.delete('/cereals/:id', CerealsController.destroy);

export default useCerealsRoute;
