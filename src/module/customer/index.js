import express from 'express';


const customer = new express();


customer.get('/', function(req, res) {
    res.ApiResponder.success('Hello customer!');
});

export default customer;