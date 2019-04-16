require('./db');

const express = require('express');
const app = express();
const userController = require('./controller/userController');
const adminController = require('./controller/adminController');
const bodyParser = require('body-parser')
const hbs = require("express-handlebars");
const session = require('express-session');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(session({
    secret: "somerandomstringheretobeasecrete"
}))

app.use(express.static('./public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())
app.engine('hbs', hbs({
    extname: 'hbs'
}))
app.set('views', './views');
app.set('view engine', 'hbs');

app.listen(3000, () => {
    console.log('Express server started on port: 3000');
});


app.use('/', userController);
app.use('/admin', adminController);

app.use((req, res, next)=>{
    const error = new Error('Not Found.');
    error.status = 404;
    next(error);

})
app.use((error, req, res, next)=> {
    console.error(error)
    const errorCode = error.status || 500;
    res.status(errorCode);
    res.render(404, {
        title: errorCode,
        message: error.message
    });
})





