class Address {
    index(req, res) {
        try {
            res.ApiResponder.success("requested addresses");
        } catch (error) {
            res.ApiResponder.error(error);
        }
    }
    show(req, res) {
        try {
            res.ApiResponder.success("requested address");
        } catch (error) {
            res.ApiResponder.error(error);
        }
    }
    store(req, res) {
        try {
            res.ApiResponder.success("created address");
        } catch (error) {
            res.ApiResponder.error(error);
        }
    }
    update(req, res) {
        try {
            res.ApiResponder.success("updated address");
        } catch (error) {
            res.ApiResponder.error(error);
        }
    }
    destroy(req, res) {
        try {
            res.ApiResponder.success("deleted address");
        } catch (error) {
            res.ApiResponder.error(error);
        }
    }
}

export default Address;