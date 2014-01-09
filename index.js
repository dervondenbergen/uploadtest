// Requires

var http = require('http');
var util = require('util');
var fs   = require('fs');
var jade = require('jade');
var formidable = require('formidable');
var couchdb = require('felix-couchdb');

var password = require('./password.js');

// Create a folder

fs.exists(__dirname + '/uploads', function (exists) {
  if (!exists) {
    console.log('Creating directory ' + __dirname + '/uploads');
    fs.mkdir(__dirname + '/uploads', function (err) {
      if (err) {
        console.log('Error creating ' + __dirname + '/uploads');
        process.exit(1);
      }
    });
  }
});

// Chose database

if (process.argv[3] == 'uberspace') {
  var client = couchdb.createClient(21701, 'localhost', 'felixdm_couchadmin', password);
} else {
  var client = couchdb.createClient(5984, 'localhost');
}

var db = client.db('uploadtest');

// Create Server

http.createServer(function (req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    var form = new formidable.IncomingForm(),
      filelist = [];

    form.uploadDir = __dirname + '/uploads';
    form.keepExtensions = true;

    form.on('fileBegin', function (name, file) {
      //rename the incoming file to the file's name
      if (file.name != 'image.jpg') {
        file.path = form.uploadDir + '/' + file.name;
      }
      console.log(file);

      filelist.push(file);

    });

    form.parse(req, function (err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      var data = { "name": fields.name, "os": fields.os, "browser": fields.browser, "filedata": JSON.stringify(filelist), "navigator": fields.nav };
      db.saveDoc(data);
      res.end(util.inspect({fields: fields, files: files}));
    //  res.end();
    });

    return;
  } else {

    // show a file upload form
    res.writeHead(200, {'content-type': 'text/html'});

    var html = jade.renderFile("./index.jade");

    res.end(html);

  }

}).listen(parseInt(process.argv[2], 10));









