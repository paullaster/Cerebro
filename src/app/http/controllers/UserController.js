class UserController {
    index(req, res) {
        try {
            return res.ApiResponder.success('Hello users from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
    show(req, res) {
        try {
            return res.ApiResponder.success('single users from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
    store(req, res) {
        try {
            return res.ApiResponder.success('store users from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
    update(req, res) {
        try {
            return res.ApiResponder.success('update users from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
    destroy(req, res) {
        try {
            return res.ApiResponder.success('destroy users from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
}

export default new UserController();