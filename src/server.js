import express from 'express';
import cors from 'cors';
import { ApiResponder } from './app/middleware/ApiResponder.js';
import appconfig from './config/app.js';
import admin from './module/admin/index.js';
import customer from './module/customer/index.js';
import farmer from './module/farmer/index.js';
import retailer from './module/retailer/index.js';
import agent from './module/agent/index.js';
import routes from './routes.js';


const app = new express();
app.use(express.json());
app.use(cors());
app.use(ApiResponder);


app.use('/admin', admin);
app.use(customer);
app.use('/farmer', farmer);
app.use('/retailer', retailer);
app.use('/agent', agent);
app.use('/', routes);

// APP SETTINGS
app.set('port', appconfig.port);
app.set('name', appconfig.name);
app.set('url', appconfig.url);
app.set('key', appconfig.key);
app.set('env', appconfig.environment);
app.set('timezone', appconfig.timezone);




app.listen(appconfig.port, () => {
    console.log(`App listening at http://localhost:${appconfig.port}`);
});