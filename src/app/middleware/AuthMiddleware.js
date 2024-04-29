import app from "../../config/app.js";

export const Authenticatd = (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            if (token) {
                jwt.verify(token, app.key, (err, decoded) => {
                    if (err) {
                        res.ApiResponder.error(err);
                    } else {
                        req.user = decoded;
                        next();
                    }
                });
            } else {
                res.ApiResponder.error('No token provided', 403);
            }
        } else {
            res.ApiResponder.error('No token provided', 403);
        }
    } catch (error) {
        res.ApiResponder.error(error);
    }
}