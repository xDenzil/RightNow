const mongoose = require("mongoose");

mongoose.connect(
  "mongodb://localhost:27017/RightNowTaxi",
  { useNewUrlParser: true },
  (err) => {
    if (!err) {
      console.log("MongoBD Connection Successful");
    } else {
      console.log("Error in DB Connection:" + err);
    }
  }
);

require("./models/cab.model");
require("./models/trip.model");

require("./models/user.model");
