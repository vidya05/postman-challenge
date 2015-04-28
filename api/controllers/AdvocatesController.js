/**
 * AdvocatesController
 *
 * @description :: Server-side logic for managing advocates
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Twit = require('twit');

module.exports = {

    //Track the reach of the tweet.
    'trackTweet': function(req, res, next) {
        var config = sails.config;
        var T = new Twit({
            consumer_key: config.twitter.consumer_key,
            consumer_secret: config.twitter.consumer_secret,
            access_token: config.twitter.access_token,
            access_token_secret: config.twitter.access_token_secret
        });

        var retweetUsers = [] ,reach = 0, retweetcount, resp = {}, tweet_id = req.param('id');
        console.log(tweet_id);

        //Get the tweet info
        T.get('statuses/show', {
            id: tweet_id
        }, function getTweetInfo(err, data, response) {
            if (err) {
                res.send(err);
            } else {

                reach = data.user.followers_count; //other components will get added later
                resp['favorites'] = data.favorite_count;
                resp['retweetcount'] = data.retweet_count;
                resp['is_With_Held'] = data.withheld_copyright; //withheld due to content
                resp['with_Held_Countries_List'] = data.withheld_in_countries;
                //Get the retweers ids
                if(data.retweet_count >0){
                T.get('statuses/retweeters/ids', {
                    id: tweet_id
                }, function getRetweeterIds(err, data, response) {
                    for (var i = 0; i < data.ids.length; i++) retweetUsers.push(data.ids[i]);

                    if (data['next_cursor'] > 0) {  //more data remaining in API response
                        T.get('statuses/retweeters/ids', {
                            id: tweet_id,
                            cursor: data['next_cursor']
                        }, getRetweeterIds);
                    } else {                    //reached end of API response
                        var retweeterIdChunks = [];
                        var i = 0,len = 0;
                        console.log(retweetUsers);
                        for (i = 0, len = retweetUsers.length; i < len; i = i + 100) { // because users/lookup API has limit of 100 ids
                            retweeterIdChunks.push(retweetUsers.slice(i, i + 100))
                        }; 

                        //Get the followers of each retweeter
                        /**@todo Should take care of duplicacy while calculating reach.*/
                        var j =0;
                        T.get('users/lookup', {
                            user_id: retweeterIdChunks[j].toString(),
                            include_entities: 'false'
                        }, function getRetweeterInfo(err, data, response) {

                            for (var k = 0; k < data.length; k++) {
                                reach = reach + data[k].followers_count; //tweet reaches to 2nd degree users through retweets
                            };
                            j = j + 1;
                            if (j < retweeterIdChunks.length) {
                                T.get('users/lookup', {
                                    user_id: retweeterIdChunks[j].toString(),
                                    include_entities: 'false'      //extra info not required
                                }, getRetweeterInfo);
                            } else {
                                resp['reach'] = reach;
                                res.send(resp);
                            }

                        });
                    }
                });
            }
            else{
                resp['reach'] = reach;
                res.send(resp);
            }

        }

        });


    },

    //Get the list of Advocates in sorted order by their priority
    'listOfAdv': function(req, res, next) {

        var page = req.param('page') || 1;
        var limit = req.param('limit') || 10;
        Advocates.find().sort({  //fetching from DB
            'priority': -1
        }).paginate({
            page: page,
            limit: limit
        }).exec(function(err, users) {
            if (err) {
                console.log("Error" + err);
                res.send(err);
            } else {
                console.log(users);
                res.send(users);
            }

        });


    }


};