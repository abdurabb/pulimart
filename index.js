require('dotenv').config()

const port = process.env.PORT
const dbConfig=require('./config/dbConfig')
const express = require('express');
const path = require('path');
const adminRoute = require('./routers/admin_route')
const userRoute = require("./routers/user_route");
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
    res.set('cache-control', 'no-store')
    next()
});


app.use(express.static(path.join(__dirname, 'public')))
// for admin routes
app.use('/admin', adminRoute);
// users route
app.use('/', userRoute)

app.listen(port, () => {
    console.log("server running started");
})