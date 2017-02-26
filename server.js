// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var fs = require("fs");

var port = process.env.PORT || 3000; // set our port

var db = require('./db');
var mongo_uri = 'mongodb://localhost:27017/hw2';

db.connect(mongo_uri, function(err) {
  if (err) {
    console.log("Error connecting to mongo");
  } else {
    console.log("Connected to mongo");
    import_mongo();
  }
})

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
// require('./app/routes')(app); // pass our application into our routes


function import_mongo() {
  // import data to mongo
  var collection = db.get().collection('factbook');
  var file_dir = './factbook.json-master';
  fs.readdir(file_dir, function(err, folders) {
    if (err) {
      console.log("Error finding directory");
    } else {
      // try to read sub directories
      folders.forEach(function(folder) {
        var sub_dir = file_dir + '/' + folder;
        fs.readdir(file_dir + '/' + folder, function(err, files) {
          if (err) {
            console.log("Error finding sub directory " + sub_dir);
          } else {
            // try to read files in sub directories
            files.forEach(function(file) {
              var json_dir = sub_dir + '/' + file;
              var json_file = JSON.parse(fs.readFileSync(json_dir).toString());
              collection.insert(json_file, {checkKeys: false})
                .then(function(data) {
                  console.log('inserted data');
                  // console.log(data);
                })
                .catch(function(err) {
                  console.log('failed to insert data ' + json_dir);
                  console.log(err);
                })
            })
          }
        })
      })
    }
  })
}






// start app ===============================================
app.listen(port); 
console.log('\nServer hosted on port ' + port);       // shoutout to the user
exports = module.exports = app;             // expose app