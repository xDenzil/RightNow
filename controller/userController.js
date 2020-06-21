const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Trip = mongoose.model('Trip');
const Cab = mongoose.model('Cab');
const User = mongoose.model('User');
const moment = require('moment');


// ------------- REQUEST RIDE / HOME ---------------- //

router.post('/riderequest', (req, res) => {
    var str = req.body.riderequest;
    var regex1 = /from (.*?) to/;
    var regex2 = /to (.*)[?]/;
    //var from = str.match(regex1);
    //var to = str.match(regex2);

    var from = regex1.exec(str);
    var to = regex2.exec(str);

    console.log(from);
    console.log(to);

    initiateRequest(from, to, req, res);
})


router.get('/', (req, res) => {
    res.render('index', {
        title: "Right Now Taxi",
    });
})


// ------------- LOGOUT ---------------- //

router.get('/logout', (req, res) => {
    req.session.destroy(function () {
        console.log("user logged out.")
    });
    res.redirect('/');
})

// ------------- LOGIN ---------------- //

router.post('/login', (req, res) => {
    User.findOne({ email: req.body.email, password: req.body.password }, (function (err, doc) {
        if (!err && !null) {
            // console.log("DOC ID", doc._id);
            console.log("EMAIL FROM FORM", req.body.email);
            console.log("PW FROM FORM", req.body.password);
            User.find({ email: req.body.email, password: req.body.password }, (function (err, doc) {
                if (!err) {
                    console.log(doc.password)
                    req.session.user = "jgtj5yu6e7oijngshngsmngfi7i6e";
                    console.log("Correct Password");
                    res.redirect('/admin');
                }
                else {
                    console.log("Incorrect pasword")
                    res.redirect('/admin');
                }
            })
            )
        }
        else {
            console.log("Email address not found.")
        }
    })
    )
})

// ------------- RATE TRIP ---------------- //

router.get('/rating', (req, res) => {
    res.render('userfeedback', {
        title: "Right Now Taxi",
    });
})

// ------------- LOADING PAGE ---------------- //

router.get('/loading', (req, res) => {
    id = req.params.tripID;
    res.render('loading', {
        title: "Right Now Taxi",
        ide: id
    });
})

// ------------- RIDE INFO ---------------- //

router.post('/ride-info', (req, res) => {
    console.log(req.body.f_name);
    Trip.findByIdAndUpdate(req.body.id, { $set: { passenger_fname: req.body.f_name, passenger_lname: req.body.l_name } }, { new: true, strict: false }).then(function (doc, err) {
        if (!err) {
            console.log(doc)
            res.redirect('/my-ride');
        }
        else {
            console.log(err);
        }
    })
})

router.get('/ride-info/:idd', (req, res) => {
    id = req.params.idd;
    Trip.findById(id, { strict: false }).then(function (doc, err) {
        res.render('ride-info', {
            title: "Right Now | Ride Info",
            id: id,
            from: doc.from,
            to: doc.to,
            distance: doc.distance,
            cost: doc.cost,
            /* d_fname: doc.driver_fname,
            d_lname: doc.driver_lname */
        });
    })
})


// ------------- LOGIN TO THE ADMIN SECTION ---------------- //

router.get('/login', (req, res) => {
    if (req.session)
        res.render('admin-login', {
            title: "Right Now | Admin Login"
        });
})

// ------------- SHOWS DETAILS OF TRIP AND DRIVER INFO ---------------- //

router.get('/my-ride', (req, res) => {
    //var id = req.params.id;
    //Trip.findById(id).then(function(doc, err, res){
    res.render('my-ride', {
        title: "Right Now | My Ride",
        /* from: doc.from,
        to: doc.to,
        distance: doc.distance,
        passengerf: doc.passenger_fname,
        passengerl: doc.passenger_lname */
    });

    if (err) {
        console.log(err);
    }
})


// ------------- SHOWS WHETHER OR NOT A CAB IS AVAILABLE ---------------- //

router.get('/pickup-status', (req, res) => {
    res.render('pickup-status', {
        title: "Right Now | Pickup Status",
        richiemessagehead: "Richie AI: Hey, your cab is on the way.",
        richiemessagep: "Let me know when you've gotten picked up.",
        buttonlabel: "It's Here. Pick-Up Confirmed.",
        buttonlink: '/my-ride'
    })
})

router.get('/pickup-status/:id', (req, res) => {
    var id= req.params.id;
    res.render('pickup-status', {
        title: "Right Now | Pickup Status",
        richiemessagehead: "Richie AI: Hey, your cab is on the way.",
        richiemessagep: "Let me know when you've gotten picked up.",
        buttonlabel: "It's Here. Pick-Up Confirmed.",
        buttonlink: '/my-ride'
    })
})


// ------------- RECEIVES THE PASSENGER'S INFORMATION AND SHOWS RIDE INFO ---------------- //


function initiateRequest(from, to, req, res) {
    var trip = new Trip();
    trip._id = new mongoose.Types.ObjectId();
    trip.from = from;
    trip.to = to;
    trip.distance = from.length + to.length;
    trip.cost = 350 + (20 * trip.distance);
    tripID = trip._id;
    trip.save((err, doc) => {
        if (err) {
            console.log("Error creating trip", err);
        }
        else {
            trippID = doc._id;
            Cab.findOneAndUpdate({ occupied: false, active: true }, { $set: { occupied: true } }, { new: true }).then(function (doc) {
                console.log("CAB INFO", doc);
                if (doc == null) {
                    Trip.findByIdAndUpdate(trippID, { $set: { status: "failed" } }, { new: true }).then(function (doc, err) {
                        if (err) {
                            console.log("Error updating Trip info");
                            console.log(doc);
                        }
                        else {
                            console.log(doc);
                            res.render('pickup-status', {
                                title: "Right Now | Pickup Status",
                                richiemessagehead: "Richie AI: Hey, Unfortunately there are no cabs at the moment.",
                                richiemessagep: "Please try again later.",
                                buttonlabel: "Back to Home.",
                                buttonlink: "/"
                            })
                        }
                    })
                }
                else {
                    console.log(doc);
                    cabID = doc._id;
                    Trip.findByIdAndUpdate(trippID, { $set: { cab_id: doc._id, driver_fname: doc.fname, driver_lname: doc.lname } }, { new: true, strict: false }).then(function (doc, err) {

                        res.render('loading', {
                            title: "Right Now Taxi",
                            id: trippID
                        });
                    })

                }
            })
        }
    })

}



module.exports = router;

