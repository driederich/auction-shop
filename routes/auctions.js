var express = require('express');
var router = express.Router();

var Auction = require('../models/auction');

// Offer Product 
router.get('/new_product', function (req, res) {
    res.render('new_product');
});

router.post('/new_product', function (req, res) {
    var titel = req.body.titel;
    var description = req.body.description;
    var category = req.body.category;
    var lowestBid = req.body.lowestBid;
    var auctionTime = req.body.auctionTime;
    var img1 = req.body.img1;
    var img2 = req.body.img2;
    var img3 = req.body.img3;

    // Validation
    req.checkBody('titel', 'Titel is required').notEmpty();
    req.checkBody('description', 'Description is required').notEmpty();
    req.checkBody('category', 'Category is required').notEmpty();
    req.checkBody('lowestBid', 'Lowest Bid is required').notEmpty();
    req.checkBody('auctionTime', 'Auction Time is required').notEmpty();
    req.checkBody('img1', 'Image1 is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('new_product', {
            errors: errors
        });
    } else {
        var newAuction = new Auction({
            vender: res.locals.user.email,
            titel: titel,
            description: description,
            category: category,
            bestBid: lowestBid,
            auctionTime: auctionTime,
            status: "open",
            img1: img1,
            img2: img2,
            img3: img3
        });

        Auction.createAuction(newAuction, function (err, auction) {
            if (err) throw err;
            console.log(auction);
        });

        req.flash('success_msg', 'New Product has been added');

        res.redirect('/');
    }
});

module.exports = router;