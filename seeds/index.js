const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedhelpers')

const mongoose = require('mongoose')
// const campground = require('./models/campground')
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "Connection error:"))
db.once("open", () => {
    console.log("Database connected")
})

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDb = async () => {
    await Campground.deleteMany({});
    // const c = new Campground({ title: 'purple field' })
    // await c.save()
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '66870e75546757cf0b3e7f4e',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit.Laborum corrupti ducimus commodi quis, ipsam vero pariatur.Rerum, quod voluptatibus minima doloremque laudantium natus, accusamus tempore excepturi laborum consequatur maiores.Sint!',
            price,
            geometry:{
                type:"Point",
                coordinates:[cities[random1000].longitude,cities[random1000].latitude]
            },
            images: [{
                url: 'https://res.cloudinary.com/dp2rkkysq/image/upload/v1720428823/YelpCamp/gcu3exd1p5ducgbgdrq0.jpg',
                filename: 'YelpCamp/gcu3exd1p5ducgbgdrq0'
            },
            {
                url: 'https://res.cloudinary.com/dp2rkkysq/image/upload/v1720428824/YelpCamp/jjhilnbbpsq7kabvnlnv.jpg',
                filename: 'YelpCamp/jjhilnbbpsq7kabvnlnv'
            }]
        })
        await camp.save()
    }
}

seedDb().then(() => {
    mongoose.connection.close()
})