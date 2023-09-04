const mongoose = require('mongoose');

const slugify = require('slugify');

//const User = require('./userModel');we need it if we embidd user in tour
//const validator = require('validator'); // its a library in github

//TODO:1-creating very simple schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //TODO: that line called valdilater cuz it validate our data
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal 40 characters'],
      minlength: [10, 'A tour name must have more or equal 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must only contain character'],
      // validator is obj and isAlpha is function check if the string contains only letters (a-zA-Z).
      //TODO: we can write validate like upove (from library) or like we write it in priceDiscount our own function
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'], //هون بنحدد الخيارات المسموحه وتحت  الرساله
        message: 'difficulty is either :easy ,medium ,difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be about 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
      // val is current value for ratingsAverage
      //round make 4.66666 to 5  so we 4.666*10 = 46.6666 and with round will be 47 then with / will become 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'], //TODO: that line called valdilater cuz it validate our data
    },
    priceDiscount: {
      type: Number,
      validate: {
        // the (this) in validator only work when  creat new document not for update document
        validator: function (val) {
          return val < this.price; // val represent the priceDiscount the user wrote in a post
        },
        message: 'Discount price  ({VALUE}) should be below regular price',
      }, // ({VALUe}) also show the number user wrote in priceDiscount but by mongoose style
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'], //TODO: that line called valdilater cuz it validate our data
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], //TODO: save rest images as srting in an array
    createdAt: {
      type: Date,
      default: Date.now(), //mongoose automaticly converd it to today date
      select: false, // we hide it from the output(response )
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    //TODO:locations data embidded in tours, startlocations obj(geojson) will embidded in tours, startlocation is just obj not doc like above
    startLocation: {
      //geojson work with lng ant lat
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'], //option allowed for type field(type is the first type)
      },
      coordinates: [Number], //mean expect array of number start with lng then lat
      address: String,
      description: String,
    },
    //the embidded doc  must be an array
    locations: [
      {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    // reviews: [{ type: mongoose.Schema.ObjectId, ref: 'Review' }],
  },
  {
    toJSON: { virtuals: true }, // to make virual below works
    toObject: { virtuals: true },
  }
);
//{{URL}}api/v1/tours?price[lt]=1000
//tourSchema.index({ price: 1 });
//this line make search faster by looking to index of price  instead of looking of whole doc one by one in dataBase, then return the docs ,ofcourse that good when we query just for single field if we query for tow field
//{{URL}}api/v1/tours?price[lt]=1000&ratingsAverage[gte]=4.7)  then we use TODO:  compound index  TODO:
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

//startLocation: '2dsphere' like we telling it is  real point on earth
tourSchema.index({ startLocation: '2dsphere' });

//TODO: virtual: means data wont be save in our database it just appear in our document and cant be used in our query

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
//عملنا خانه افتراضيه مصفوفة لنحفظ فيا الريفوز التابيعين ل تور ،  ريف هي الموديل يلي بدي اربطو مع التور ،  فورينز اسم التور ب سكيما ريفيوز ، لوكال هي الخانه يلي عم حطها بل ريفيوز سكيما
//بهالخانه الافتراضيه عم جيب فيها كل الريفوز يلي فين اي دي للتور المطلوبه
// كل ريفو هيك شكلو لاني عملتو ببيوليت بل تور كونترول"createdAt": "2023-08-02T05:39:22.744Z",
//     "_id": "64c9ee280149fa14003ae7d6",
//     "review": "love it !!",
//     "rating": 2,
//     "tour": "5c88fa8cf4afda39709c2955",
//     "user": {
//         "_id": "64c8e18dacd17d12a03e4700",
//         "name": "user"
//     },
//     "__v": 0,
//     "id": "64c9ee280149fa14003ae7d6"
// },
// ورجعت بل ريفو موديل بل ميدل وير غيرت من التور لحتي مانعجق المعلومات
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//TODO: Document Middleware : runs befor only .save() and .creat() not for update
tourSchema.pre('save', function (next) {
  // console.log(this); // here we have access to current document befor it save to our database (this keyword point to our current proccess document)
  this.slug = slugify(this.name, { lower: true }); //must define slug properties inside our tourschema to appear in result
  next();
});
//TODO: this code below is for embid user in tour
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//guidesPromises is array of Promise so await it
//   //console.log(guidesPromises);
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
//TODO:
// tourSchema.pre('save', function (next) {
//   console.log('will save document..');
//   next();
// });

// (post) middleware function : excuted after all pre middleware completed
// // here we have access to finished saved document (doc)
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//TODO:QUERY MIDDLEWARE: run between any methods start with find() like ( new APIfeatures(Tour.find(), req.query))  and  await ,(find) is the huck ,here (this) keyword point to current query obj,,,lecture 106 min 13:00
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); //هيديfind مو المقصوده بالشرح  جديده
  // ofcurse we need to difine secretTour in our tourschema to appear in result
  this.start = Date.now();

  next();
});

// post : access all documents return from our query
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} MILseconds`);
  // console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE: (this) point to current aggregate
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline());
//   next();
// });

//TODO: 2-creating model from our schema (tourschema) the first Tour is the name of variable the second Tour is the name of the model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
