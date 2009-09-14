/**
 * Copyright (c) 2009 Remy Sharp / @rem
 * licensed under public BSD
 *
 * TODO: use regex instead of loops.
 * Usage: twitterSearch.filter(tweet, searchString) - returns true/false
 */

var twitterSearch = (function () {
 return {
   filter : function (tweet, search, includeHighlighted) {
     var i = 0, s = '', text = tweet.text.toLowerCase();

     if (typeof search == "string") {
       search = this.formatSearch(search);
     }

     // loop ignore first
     if (search['not'].length) {
       for (i = 0; i < search['not'].length; i++) {
         if (text.indexOf(search['not'][i]) !== -1) {
           return false;
         }
       }
     }

     if (search['and'].length) {
       for (i = 0; i < search['and'].length; i++) {
         s = search['and'][i];

         if (s.substr(0, 3) === 'to:') {
           if (!RegExp('^@' + s.substr(3)).test(text)) {
             return false;
           }
         } else if (s.substr(0, 5) == 'from:') {
           if (tweet.user.screen_name !== s.substr(5)) {
             return false;
           }
         } else if (text.indexOf(s) === -1) {
           return false;
         }
       }
     }

     if (search['or'].length) {
       for (i = 0; i < search['or'].length; i++) {
         s = search['or'][i];

         if (s.substr(0, 3) === 'to:') {
           if (RegExp('^@' + s.substr(3)).test(text)) {
             return true;
           }
         } else if (s.substr(0, 5) == 'from:') {
           if (tweet.user.screen_name === s.substr(5)) {
             return true;
           }
         } else if (text.indexOf(search['or'][i]) !== -1) {
           return true;
         }
       }
     } else if (search['and'].length) {
       return true;
     }

     return false;
   },

   formatSearch : function (search, caseSensitive) {
     // search can match search.twitter.com format
     var blocks = [], ors = [], ands = [], i = 0, negative = [], since = '', until = '';

     search.replace(/(["'](.*?)["']|\S+\b)/g, function (m) {
       m = m.replace(/^["']+|["']+$/g, '');
       blocks.push(m);
     });

     for (i = 0; i < blocks.length; i++) {
       if (blocks[i] == 'OR' && blocks[i+1]) {
         ors.push(blocks[i-1].toLowerCase());
         ors.push(blocks[i+1].toLowerCase());
         i++;
         ands.pop(); // remove the and test from the last loop
       } else if (blocks[i].substr(0, 1) == '-') {
         negative.push(blocks[i].substr(1).toLowerCase());
       } else {
         ands.push(blocks[i].toLowerCase());
       }
     }

     return {
       'or' : ors,
       'and' : ands,
       'not' : negative
     };
   },

   // tweets typeof Array
   filterTweets : function (tweets, search, includeHighlighted) {
     var updated = [], tmp, i = 0;

     if (search instanceof String) {
       search = this.formatSearch(search);
     }

     for (i = 0; i < tweet.length; i++) {
       tmp = filter(tweet[i], search, includeHighlighted);
       if (tmp) {
         updated.push(tmp);
       }
     }

     return updated;
   }
 };
})();