
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    from: {
        type: String,
        required: 'Required.'
    },
    to: {
        type: String,
        required: 'Required.'
    },
    request_time:{
        type: Date,
        default: Date.now
    },
    distance: {
        type: Number,
        required: 'Required.'
    },
    cost: {
        type: Number,
        required: 'Required.'
    },
    status: {
        type: String,
        default: "success"
    },
    driver_fname: String,
});





mongoose.model("Trip", tripSchema)