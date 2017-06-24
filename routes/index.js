var express = require('express');
var router = express.Router();
var Auction = require('../models/auction');

// Get Homepage
router.get('/', ensureAuthenticated, function (req, res) {
    Auction.getOpenAuctions(function (err, docs) {
        var productChunks = [];
        var chunkSize = 4;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize))
        }
        res.render('index', {products: productChunks});
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

router.get('/show_product/:id', function (req, res) {
    var auctionId = req.params.id;
    Auction.getOffer(auctionId, function (err, doc) {
        res.render('product_details', {product: doc})
    });
});

router.get('/show_user', ensureAuthenticated, function (req, res) {
    var offeredChunks = [];
    var purchasedChunks = [];
    var bestOfferChunks = [];
    var chunkSize = 4;

    Auction.getAuctionsByVender(res.locals.user.email, function (err, docs) {
        for (var i = 0; i < docs.length; i += chunkSize) {
            offeredChunks.push(docs.slice(i, i + chunkSize))
        }
    });

    Auction.getClosedAuctionsByBestBidder(res.locals.user.email, function (err, docs) {
        for (var i = 0; i < docs.length; i += chunkSize) {
            purchasedChunks.push(docs.slice(i, i + chunkSize))
        }
    });

    Auction.getOpenAuctionsByBestBidder(res.locals.user.email, function (err, docs) {
        for (var i = 0; i < docs.length; i += chunkSize) {
            bestOfferChunks.push(docs.slice(i, i + chunkSize))
        }
    });


    res.render('products_users', {offered: offeredChunks, purchased: purchasedChunks, bestOffer: bestOfferChunks});
});

router.post('/bid/:id', function (req, res) {
    var auctionId = req.params.id;
    var bid = req.body.bid;

    // Validation
    req.checkBody('bid', 'Bid is required').notEmpty();
    req.checkBody('bid', 'Bid must be a numeral').isInt();

    var errors = req.validationErrors();

    if (errors) {
        res.render('product_details', {
            errors: errors
        });
    } else {
        Auction.updateAction(res.locals.user.email, bid, auctionId, function (err, docs) {
            if (err) throw err;
        });

        req.flash('success_msg', 'Your bid has been accepted');

        var path = "/show_product/" + auctionId;
        res.redirect(path);
    }
});

module.exports = router;