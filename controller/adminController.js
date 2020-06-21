const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Cab = mongoose.model('Cab');
const Trip = mongoose.model('Trip');
const User = mongoose.model('User');
const session = require('express-session');
const cookieParser = require('cookie-parser');

router.use(cookieParser());
router.use(session({
    secret: "somerandomstringheretobeasecrete"
}))

// ------------- ADMIN INDEX ---------------- //

router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/admin/cab-summary');
    } else {
        res.redirect("/login")
    }

})


// ------------- CAB SUMMARY PAGE ---------------- //

router.get('/cab-summary', (req, res) => {
    if (req.session.user) {
        Trip.aggregate([
            {
                $match: { "status": 'success' }
            },
            {
                $group: {
                    _id: '$cab_id',
                    total_km: { $sum: "$distance" },
                    total_earnings: { $sum: "$cost" }
                }
            }],
            function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('cab-summary', {
                        title: "Right Now | Cab Summary",
                        content: result,
                    })
                }
            });
    }
    else {
        res.redirect("/login");
    }

})


// ------------- FAILED REQUESTS ---------------- //

router.get('/failed', (req, res) => {
    if (req.session.user) {
        Trip.find({ status: "failed" }).then((docs) => {
            res.render('failed-requests', {
                title: "Right Now | Failed",
                failedreq: docs,
            })

        })
    }
    else {
        res.redirect("/login");
    }
})


// ------------- SEE ALL AVAILABLE CABS ---------------- //

router.get('/manage-cabs', (req, res) => {
    if (req.session.user) {
        Cab.find({ "active": true }).then((activeCabs) => {
            var activeCabs = activeCabs;
            console.log(activeCabs);

            Cab.find({ "active": false }).then((inactiveCabs) => {
                var inactiveCabs = inactiveCabs;
                res.render('manage-cabs', {
                    "title": "Right Now | Manage Cabs",
                    "activeCabs": activeCabs,
                    "inactiveCabs": inactiveCabs
                });
            });
        });
    }
    else {
        res.redirect('/login');
    }
})


// ------------- COMMISSION / DECOMMISSION CABS ---------------- //


router.get('/manage-cabs/decommission/:cabid', (req, res) => {
    if (req.session.user) {
        const id = req.params.cabid;
        Cab.findOneAndUpdate({ _id: id }, { $set: { active: false } }, (err, doc) => {
            if (!err) {
                console.log(doc);
                res.redirect('/admin/manage-cabs');
            }
            else {
                console.log("Error during update:" + err);
            }
        });
    }
    else {
        res.redirect("/login");
    }
})


router.get('/manage-cabs/recommission/:cabid', (req, res) => {
    if (req.session.user) {
        const id = req.params.cabid;
        Cab.findOneAndUpdate({ _id: id }, { $set: { active: true } }, (err, doc) => {
            if (!err) {
                console.log(doc);
                res.redirect('/admin/manage-cabs');
            }
            else {
                console.log("Error during update:" + err);
            }
        });
    }
    else {
        res.redirect('/login');
    }
})


// ------------- ADD A CAB ---------------- //


router.get('/add', (req, res) => {
    if (req.session.user) {
        res.render('add-cab', {
            title: "Right Now | Add Cab"
        });
    }
    else {
        res.redirect('/login');
    }
})

router.post('/add', (req, res) => {
    if (req.session.user) {
        insertRecord(req, res);
        console.log(req.body);
        res.render('manage-cabs', {
            "title": "Right Now | Manage Cabs",
            "activeCabs": activeCabs,
            "inactiveCabs": inactiveCabs
        });
    }
    else {
        res.redirect("/login");
    }
})


// ------------- FUNCTIONS ---------------- //


function insertRecord(req, res) {
    if (req.session.user) {
        var cab = new Cab();
        //_id: new mongoose.Types.ObjectId(),
        cab.trn = req.body.trn;
        cab.fname = req.body.fname;
        cab.lname = req.body.lname;
        cab.vehicle_model = req.body.vehicle_model;
        cab.vehicle_year = req.body.vehicle_year;
        cab.active = true;
        cab.save((err, doc) => {
            if (!err)
                res.redirect('/admin/manage-cabs');
            else {
                console.log("Error during insert:" + err);
            }
        });
    }
    else {
        res.redirect("/login");
    }
};

module.exports = router;

