import express from "express";
import useCerealsRoute from "./routes/cereals.js";
import useCategoryroute from "./routes/category.js";
import useUserRoutes from "./routes/user.js";

const routes = express.Router();

routes.use(useCerealsRoute);
routes.use(useCategoryroute);
routes.use(useUserRoutes);

export default routes;