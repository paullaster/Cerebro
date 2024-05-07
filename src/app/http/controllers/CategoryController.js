class CategoryController {
    index(req, res) {
        try {
            return res.ApiResponder.success('Hello categories from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
    show(req, res) {
        try {
            return res.ApiResponder.success('single categories from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
    store(req, res) {
        try {
            return res.ApiResponder.success('store categories from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
    update(req, res) {
        try {
            return res.ApiResponder.success('update categories from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
    destroy(req, res) {
        try {
            return res.ApiResponder.success('destroy categories from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
}

export default new CategoryController();