var request = require('request');
// MODULES
const keys = require('./keys');
const Twitter = require('twitter');
const Spotify = require('node-spotify-api');
const moment = require('moment');
const fs = require('fs');
const chalk = require('chalk');

// VARS
let userInput1 = process.argv[2];
let userInput2 = process.argv[3];

// EVALUATION
var letsGo = () => {
  if (userInput1) {
    if (userInput1 === "my-tweets") {
      if (!userInput2) {
        userInput2 = "nodemashups";
      }
      twit();
    }
    if (userInput1 === "spotify-this-song") {
      if (!userInput2) {
        userInput2 = "The Sign"; //0hrBpAOgrt8RXigk83LLNE
      }
      spot();
    }
    if (userInput1 === "movie-this") {
      if (!userInput2) {
        userInput2 = "Mr+Nobody";
      }
      omdb();
    }
    if (userInput1 === "do-what-it-says") {
      filesys();
    }
    if (userInput1 === "help" || userInput1 === "h") {
      console.log(chalk.blue("This app accepts the following commands:"));
      console.log(chalk.yellow("'my-tweets' [string]"));
      console.log(chalk.yellow("'movie-this' [string]"));
      console.log(chalk.yellow("'spotify-this-song' [string]"));
      console.log(chalk.yellow("'do-what-it-says'"));
      console.log(chalk.blue("The first 3 take one additional parameter enclosed in 'quotes'."));
      return;
    }
  }
  log();
}

var twit = () => {
  var client = new Twitter({
    consumer_key: keys.auth.twitterKeys.consumer_key,
    consumer_secret: keys.auth.twitterKeys.consumer_secret,
    access_token_key: keys.auth.twitterKeys.access_token_key,
    access_token_secret: keys.auth.twitterKeys.access_token_secret
  });

  var params = {
    screen_name: userInput2
  };
  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      var cleanTweets = JSON.stringify(tweets, null, 2);
      var cleanResponse = JSON.stringify(response, null, 2);
      tweets.forEach(function(item) {
        console.log(chalk.blue(moment(item.created_at, "ddd MMM DD HH:mm:ss SSSSS YYYY").utc().format("MM-DD-YYYY hh:mm")) +
          chalk.dim(" | ") +
          chalk.yellow(item.text));
      })
    }
  });
}

var spot = () => {
  var spotify = new Spotify({
    id: keys.auth.spotifyKeys.id,
    secret: keys.auth.spotifyKeys.secret
  });

  spotify.search({
    type: 'track',
    query: userInput2
  }, function(err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }
    var cleanSpotify = JSON.stringify(data, null, 2);
    var theData = data.tracks.items;
    theData.forEach(function(item) {
      console.log(chalk.bgBlue(item.artists[0].name), chalk.blue(item.name), item.album.name, chalk.dim(item.external_urls.spotify), chalk.dim(item.id));
    });
  });
}

var omdb = () => {

  request('http://www.omdbapi.com/' + '?apikey=40e9cece&t=' + userInput2, function(error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    var cleanOMDB = JSON.parse(body, null, 2); // Print the HTML for the Google homepage
    console.log(chalk.bgBlue.grey.bold(cleanOMDB.Title), cleanOMDB.Year, cleanOMDB.Language);
    console.log(chalk.blue.bold("IMDb Rating:"), cleanOMDB.Ratings[0].Value);
    console.log(chalk.blue.bold("Rotten Tomatoes Rating:"), cleanOMDB.Ratings[1].Value);
    console.log(cleanOMDB.Plot);
    console.log(chalk.bgBlack("Actors:"), chalk.gray(cleanOMDB.Actors));
    // console.log(chalk.bgBlue(cleanOMDB.Title), cleanOMDB.Year, cleanOMDB.Ratings[0].Value, cleanOMDB.Ratings[1].Value, cleanOMDB.Country, cleanOMDB.Language, chalk.blue(cleanOMDB.Plot), chalk.dim(cleanOMDB.Actors));
  });
}

var filesys = () => {
  fs.readFile('../random.txt', (err, data) => {
    if (err) throw err;
    var cleanRead = data.toString('utf8');
    console.log(cleanRead)

    var readSplit = cleanRead.trim().split(",");

    userInput1 = readSplit[0];
    userInput2 = readSplit[1];

    letsGo();

  });
}

var log = () => {
  fs.appendFile('../log.txt', userInput1 + " " + userInput2 + "\n", (err) => {
    if (err) throw err;
    console.log('The "data to append" was appended to file!');
  });
}

letsGo();
