'use strict';
app.factory('catFactory', function() {
    return {
        //these are not pictures of cats. Sorry to disappoint you.
        cats: [{
            cat: 'Miscellaneous',
            url: 'http://i.imgur.com/dPFUPoJ.gif'
        }, {
            cat: 'History',
            url: 'http://i.imgur.com/YBFVD4Y.jpg'
        }, {
            cat: 'Literature',
            url: 'http://i.imgur.com/ZNgmNku.jpg'
        }, {
            cat: 'Art',
            url: 'http://i.imgur.com/YCirp.jpg'
        }, {
            cat: 'Current Events',
            url: 'http://i.imgur.com/Ibv1KfY.jpg'
        }, {
            cat: 'Sports',
            url: 'http://i.imgur.com/7ZTDKHy.jpg'
        }, {
            cat: 'Entertainment',
            url: 'http://i.imgur.com/CGopHB7.png'
        }, {
            cat: 'Food and Drink',
            url: 'http://i.imgur.com/l1OfE4g.jpg'
        }, {
            cat: 'Science',
            url: 'http://i.imgur.com/B3DChMk.jpg'
        }]
    };
});