const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/CatchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const campgrounds = require('../controllers/campground')
const { campgroundSchema } = require('../schemas.js')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(catchAsync(campgrounds.deleteCampground))


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router

// MVC => MODELS VIEWS(views dir) CONTROLLERS(main logic)
// multer is to parse multipart form data
// env files to keep secrets such as api key