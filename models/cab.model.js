
const mongoose = require('mongoose');

const cabSchema = new mongoose.Schema({
    trn: {
        type: String,
        required: 'Cab Driver TRN is required.'
    },
    fname: {
        type: String,
        required: 'Cab Driver first name is required.'
    },
    lname: {
        type: String,
        required: 'Cab Driver last name is required.'
    },
    vehicle_model: {
        type: String,
        required: 'Vehicle Model is required.'
    },
    vehicle_year: {
        type: String,
        required: 'Vehicle Year is required.'
    },
    active: Boolean,
    occupied: Boolean
});



mongoose.model("Cab", cabSchema)