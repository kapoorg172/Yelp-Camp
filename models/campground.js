const mongoose = require('mongoose')
const Review = require('./review')
const { coordinates } = require('@maptiler/client')
const { campgroundSchema } = require('../schemas')
const Schema = mongoose.Schema

// 	https://res.cloudinary.com/dp2rkkysq/image/upload/v1720432974/YelpCamp/bf0oya5rzfp8rvgm9lai.png

const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } };
const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    images: [imageSchema],
    description: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
},opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

CampgroundSchema.post('findOneAndDelete', async (doc) => {
    // console.log(doc)
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)