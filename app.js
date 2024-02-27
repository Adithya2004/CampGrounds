const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campgrounds = require('./routes/campgrounds.js');
const Reviews = require('./routes/reviews.js');
const session = require('express-session');
const flash = require('connect-flash');

mongoose.connect('mongodb://0.0.0.0:27017/campgrounds',{});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
const sessionConfig = {
    secret:'AJNDALJANANHBDKFHBELFBLEIDHBDUBCAUYD',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now()+1000*60*60*7*24,
        maxAge:1000*60*60*7*24,
    }
}
const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use("/campgrounds",Campgrounds);
app.use("/campgrounds/:id/reviews",Reviews);
app.use(express.static('public'));
app.use(session(sessionConfig))
app.use(flash())


app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})

