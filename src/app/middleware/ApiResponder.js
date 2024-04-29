 export const ApiResponder = (req, res, next) => {
try {
    res.ApiResponder = {
        success(data = null, status = 200, msg = "Success") {
            res.status(status).json({
                message: msg,
                data: data
            });
        },
        error(data = null, status = 500, msg = "Error") {
            res.status(status).json({
                message: msg,
                data: data
            });
        },
    }
} catch (error) {
    res.ApiResponder.error(error);
}
next();
}