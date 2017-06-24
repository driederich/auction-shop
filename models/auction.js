var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');

// Auction Schema
var AuctionSchema = mongoose.Schema({
    vender: String,
    titel: String,
    description: String,
    category: String,
    time: {
        type: Date, default: Date.now
    },
    auctionTime: Number,
    status: String,
    img1: String,
    img2: String,
    img3: String,
    bestBidder: String,
    bestBid: Number
});

AuctionSchema.plugin(autoIncrement.plugin, {model: 'Auction', field: 'auctionId'});

var Auction = module.exports = mongoose.model('Auction', AuctionSchema);

module.exports.createAuction = function (newAuction, callback) {
    newAuction.save(callback);
}

module.exports.getOpenAuctions = function (callback) {
    var query = {status: "open"};
    Auction.find(query, function (err, auction) {
        for (var i = 0; i < auction.length; i++) {
            var startDate = auction[i].time;
            console.log(startDate);
            var nowDate = new Date();

            var timeDiff = Math.abs(nowDate.getTime() - startDate.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

            if (diffDays >= auction[i].auctionTime) {
                auction[i].status = "closed";

                var transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'auctionshop.noreply@gmail.com',
                        pass: 'seproject'
                    }
                });

                var text = 'You won the bid! ' + auction[i].title + ' is now all yours';

                var mailOptions = {
                    from: 'auctionshop.noreply@gmail.com',
                    to: auction[i].bestBidder,
                    subject: 'ActionShop: Bid Information',
                    text: text
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Message sent: ' + info.response);
                        res.json({yo: info.response});
                    }
                    ;
                });

                auction[i].save(function (err) {
                    if (err) throw err;
                    console.log('Auctions successfully updated!');
                });
            }
        }
    });

    var query = {status: "open"};
    Auction.find(query, callback);
}

module.exports.getOffer = function (auctionId, callback) {
    var query = {auctionId: auctionId};
    Auction.findOne(query, callback)
}

module.exports.getAuctionsByVender = function (username, callback) {
    var query = {vender: username};
    Auction.find(query, callback);
}

module.exports.getOpenAuctionsByBestBidder = function (username, callback) {
    var query = {bestBidder: username, status: "open"};
    Auction.find(query, callback);
}

module.exports.getClosedAuctionsByBestBidder = function (username, callback) {
    var query = {bestBidder: username, status: "closed"};
    Auction.find(query, callback);
}

module.exports.updateAction = function (bidder, bid, id, callback) {
    var query = {auctionId: id};
    Auction.findOne(query, function (err, auction) {
        if (err) throw err;

        if (bid >= auction.bestBid) {
            auction.bestBidder = bidder;
            auction.bestBid = bid;

            auction.save(function (err) {
                if (err) throw err;
                console.log('Auctions successfully updated!');
            });
        }
    });
}

