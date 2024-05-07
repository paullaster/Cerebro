class CerealsController {
    index(req, res) {
        try {
            return res.ApiResponder.success('Hello cereals from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
    show(req, res) {
        try {
            return res.ApiResponder.success('single cereals from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
    store(req, res) {
        try {
            return res.ApiResponder.success('post cereals from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
    update(req, res) {
        try {
            return res.ApiResponder.success('update cereals from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
    destroy(req, res) {
        try {
            return res.ApiResponder.success('delete cereals from controller');
        } catch (error) {
            return res.ApiResponder.error(error)
        }
    }
    
}

export default new CerealsController();