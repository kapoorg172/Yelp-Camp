const express = require('express')
const router = express.Router({ mergeParams: true })
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
// so that data from campgrounds can be referenced and routers try to maintain new params

const catchAsync = require('../utils/CatchAsync')
const reviews = require('../controllers/reviews')

const Campground = require('../models/campground')
const Review = require('../models/review')
const ExpressError = require('../utils/ExpressError')
const { reviewSchema } = require('../schemas.js')
// joi schema


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.postReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router