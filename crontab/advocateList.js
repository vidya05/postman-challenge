var Twit = require('twit');


module.exports = {

    'run': function() {// Runs every one hour
        
        console.log("Running scheduled job to get Advocates data");

        var T = new Twit({
            consumer_key: 'XklIkJeQlzctxe0Cqgjs6rDJ4',
            consumer_secret: 'eOjFiJsokjGz2Ob8yzBRfFw9MR5G5VLCODI1vEY90sM8bsPHvp',
            access_token: '733060994-OOpnGMwEnEbiXxaHJapCjzeuDPH3UaWtdEFBJAJM',
            access_token_secret: 'XaJqYp0hWHI1TcZlsAvXfPkXmMIoiQWgdfwLA6yWT64'
        });
        var screen_name = 'postmanclient', userMap = {}, i = 0, dataArray = [] , retweetArray = [];
         //Get the follower ids
        T.get('followers/ids', {
            screen_name: screen_name
        }, function getFollowerIds(err, data, response) {
            if(err){
                console.log(err);
                return;
            }
            else if(data.errors)
                console.log(data.errors[0]);
                return;
            }

            for ( i = 0; i < data.ids.length; i++) followerIdArray.push(data.ids[i]);

            if (data['next_cursor'] > 0) {  //more data remaining in API response
                T.get('followers/ids', {
                    screen_name: screen_name,
                    cursor: data['next_cursor']
                }, getFollowerIds);
            } else {     //reached end of API response
               
                var followerChunks = [], i = 0,len = 0;

                for (i = 0, len = followerIdArray.length; i < len; i = i + 100) { // because users/lookup API has limit of 100 ids
                    followerChunks.push(followerIdArray.slice(i, i + 100));
                };
                var j =0;
                T.get('users/lookup', {
                    user_id: followerChunks[j].toString() || "",
                    include_entities: 'false'
                }, function getFollowerInfo(err, data, response) {
                    if(data.errors){
                        console.log(data.errors[0]);
                    }
                    else
                    console.log("j ::" + j);
                    console.log(data.length);

                    for (var k = 0; k < data.length; k++) {
                        userMap[data[k].id] = data[k].followers_count
                    };
                    }
                    j = j + 1;
                    if (j < followerChunks.length) {
                        T.get('users/lookup', {
                            user_id: followerChunks[j].toString(),
                            include_entities: 'false'
                        }, getFollowerInfo);
                    } else {
                        console.log("searching tweets");

                        T.get('search/tweets', {
                            q: screen_name,
                            count: 100
                        }, function getSearchTweetInfo(err, data, response) {
                            if(err){
                                console.log(err);
                                return;
                            }

                            for (i = 0; i < data.statuses.length; i++) userMap[data.statuses[i].user.id] = (data.statuses[i].user.followers_count) * 3; //dataArray.push({userId : data.statuses[i].user.id});


                            if (data && data.search_metadata.next_results) {
                                T.get('search/tweets', {
                                    q: screen_name,
                                    count: 100,
                                    max_id: data.search_metadata.next_results.split('max_id=')[1].split('&')[0]
                                }, getSearchTweetInfo);
                            } else {
                                for (var key in userMap) {

                                    var dataMap = {};
                                    dataMap['userId'] = key,
                                    dataMap['priority'] = userMap[key];
                                    dataArray.push(dataMap);
                                };
                                console.log(dataArray.length);
                                console.log("near to creating");


                                Object.keys(userMap).forEach(function(key) {  //For each of the keys in the map insert or update in the database
                                    var userId = key;
                                    var priority = userMap[key];
                                    console.log("in obect key");
                                    Advocates.findOne({
                                        userId: userId
                                    }, function(err, adv) {
                                        if (adv) {
                                            //update
                                            Advocates.update(userId, {
                                                priority: priority
                                            }, function(err) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                            });
                                        } else {
                                            console.log("in createing  " + dataArray[h]);

                                            Advocates.create({
                                                userId: userId,
                                                priority: priority
                                            }, function(err, adv) {
                                                if (adv) {
                                                    console.log("Created");
                                                } else if (err) {
                                                    console.log(err);
                                                }
                                            })
                                        }

                                    });
                                });

                            }
                        });
                    }
                });
            }
        });

    }



};