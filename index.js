if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

console.log(process.env.SECRET)
const express = require('express')
const path = require('path')
const app = express()
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const Campground = require('./models/campground')
const Review = require('./models/review')
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const ejsMate = require('ejs-mate')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
// const dburl='mongodb://localhost:27017/yelp-camp'
const MongoDBStore = require('connect-mongo')(session);
// const catchAsync = require('./utils/CatchAsync')
// const expressError = require('./utils/ExpressError')



const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')

const mongoose = require('mongoose')
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi')
// const campground = require('./models/campground')
// const campground = require('./models/campground')
// const campground = require('./models/campground')
// 
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dpnpsli.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "Connection error:"))
db.once("open", () => {
    console.log("Database connected")
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
// to parse the post request
app.use(methodOverride('_method'))
// for editing
app.use(express.static(path.join(__dirname, 'public')))
// for serving static assets
app.use(mongoSanitize({
    replaceWith: '_',
}))
// to prevent mongo injections
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dp2rkkysq/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const store = new MongoDBStore({
    url: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dpnpsli.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
    secret: 'thisshouldbeabettersecret',
    touchAfter: 24 * 60 * 60
    // in seconds
    // unnecessary resaves
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const configSession = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret',
    // resave: false,
    // saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
        // it is in milliseconds so the conversion for a week
    }
}
app.use(session(configSession))
// for serving sessions
app.use(flash())
// flash msgs
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    // res.send("HELLO FROM YELP CAMP")
    res.render('home.ejs')
})

// app.get('/makecampground', async (req, res) => {
//     // res.send("HELLO FROM YELP CAMP")
//     // res.render('home.ejs')
//     const camp = new Campground({ title: 'My Backyard', description: 'cheap camping' })
//     await camp.save()
//     res.send(camp)
// })





app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    // the above is default
    if (!err.message)
        err.message = 'Oh no!! Something Went Wrong!!'
    res.status(statusCode).render('error.ejs', { err })
    res.send('Something Went Wrong!!')
})
// error comes to this middleware

app.listen(3000, () => {
    console.log('SERVING ON PORT 3000!!')
})

// we shall be using JOI schema validations
// passport to use authentication comes with different strategies and ssos
// hides in a lot of stuff such as the basics
// need to eve prevent sql and mongo injections restrict queries and prohibit signs
// XSS Cross site scripting to access others websites via a script