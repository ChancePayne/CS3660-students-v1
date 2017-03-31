console.log('Loading Server');

//load main modules
var express = require('express');
var fs = require('fs');
// var nconf = require('nconf');
var colors = require('colors');
//load express milddleware mdoules
var morgan = require('morgan');
var winston = require('winston');
var compression = require('compression');
// var favicon = require('serve-favicon');
var path = require('path');
var bodyParser = require('body-parser');
var WEB = path.resolve('../web'); // __dirname is the directory where the application is running from

//var WEB = __dirname.replace('server', 'web');
var SERVER = __dirname; // __dirname is the directory where the application is running from
var logger = new winston.Logger({
        transports: [
            new winston.transports.File({
                level: 'info',
                filename: 'logs/logs.log',
                handleExceptions: true,
                json: true,
                maxsize: 5242880,
                maxFiles: 5,
                colorize: true
            }),
            new winston.transports.Console({
                level: 'debug',
                handleExceptions: true,
                json: false,
                colorize: true
            })
        ],
        exitOnError: false
    });


logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};

//create express app
var app = express();

//insert middleware

// app.use(logger());

app.use(require("morgan")("combined", { stream: logger.stream }));
app.use(compression());
// app.use(favicon(WEB + '/img/favicon.ico'));

app.use(bodyParser.json());

//REST end points
// create
app.post('/api/v1/students', function(req, res) {
   var data = req.body;
   if (!data) {
      res.sendStatus(400);
      return;
   }

   fs.readdir(`${__dirname}/students`, function(err, files) {
      if (err) {
         res.sendStatus(500);
         return;
      };

      var fileList = files.map(fileName => fileName.replace('.json', ''));

      var id = pad(parseInt(fileList[fileList.length - 1]) + 1);
      data.id = id;

      fs.writeFile(`${__dirname}/students/${id}.json`, JSON.stringify(data, null, 2), 'utf8', function(err) {
         if (err) {
            res.sendStatus(500);
            return;
         };

         res.status(201).json(id); // send status 200 and fileList
      });
   });
});

// list
app.get('/api/v1/students/students.json', function(req, res) {
   fs.readdir(`${__dirname}/students`, function(err, files) {
      if (err) {
         res.sendStatus(404);
      }

      var fileList = files.map(fileName => fileName.replace('.json', ''));
      res.json(fileList); // send status 200 and fileList
   });
});

// read
app.get('/api/v1/students/:id.json', function(req, res) {
   var id = req.params.id;
   fs.readFile(`${__dirname}/students/${id}.json`, 'utf8', function(err, data) {

       if (err) {
        console.log(err.toString().red);
         res.sendStatus(404);
      }
      
      res.set('id', req.params.id);
      data = JSON.parse(data);
      data.id = req.params.id;
      res.status(200).json(data); // send status 200 and fileList
   });

});

// update
app.put('/api/v1/students/:id.json', function(req, res) {
   var id = req.params.id;
   var data = JSON.stringify(req.body, null, 2);
   
   console.log('content-type = ' + req.get('Content-Type'));
   console.log('data = ' + JSON.stringify(req.body));

   fs.writeFile(`${__dirname}/students/${id}.json`, data, 'utf8', function(err) {
      if (err)
          console.log(err.toString().red);

      res.sendStatus(204); // send status 200 and fileList
   });

});

// delete
app.delete('/api/v1/students/:id.json', function(req, res) {
   var id = req.params.id;

   if (id == null || id == "")
       res.sendStatus(404);

   fs.unlink(`${__dirname}/students/${id}.json`, function(err) {
       if (err)
           console.log(err.toString().red);

       res.sendStatus(204); // send status 200 and fileList
   });

});




//traditional webserver stuff for serving static files

app.use(express.static(WEB));
//app.use(express.static(SERVER));
app.get('*', function(req, res) {
   res.status(404).sendFile(WEB + '/404.html');
});

// var server = app.listen(process.env.PORT, process.env.IP);
var server = app.listen(80, "127.0.0.1");

console.log('Server is listening');

function gracefullShutdown() {
   console.log('\nStarting Shutdown');
   server.close(function() {
      console.log('\nShutdown Complete');
   });
}

process.on('SIGTERM', function() { //kill (terminate)
   gracefullShutdown();
});

process.on('SIGINT', function() { //Ctrl+C (interrupt)
   gracefullShutdown();
});

//SIGKILL (kill -9) can't be caught by any process, including node
//SIGSTP/SIGCONT (stop/continue) can't be caught by node
// Yes I just copied and pasted the code from Canvas. 

function pad(num) {
   var s = "0000" + num;
   return s.substr(s.length - 4);
}
