'use strict';
app.factory('catFactory', function() {
    return {
        //these are not pictures of cats. Sorry to disappoint you.
        cats: [{
            cat: 'Miscellaneous',
            url: '/img/cat/misc.png'
        }, {
            cat: 'History',
            url: '/img/cat/history.png'
        }, {
            cat: 'Literature',
            url: '/img/cat/literature.png'
        }, {
            cat: 'Art',
            url: '/img/cat/art.png'
        }, {
            cat: 'Current Events',
            url: '/img/cat/current.png'
        }, {
            cat: 'Sports',
            url: '/img/cat/sports.png'
        }, {
            cat: 'Entertainment',
            url: '/img/cat/entertainment.png'
        }, {
            cat: 'Food and Drink',
            url: '/img/cat/food.png'
        }, {
            cat: 'Science',
            url: '/img/cat/science.png'
        }]
    };
});