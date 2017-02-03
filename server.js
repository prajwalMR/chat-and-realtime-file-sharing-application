var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var multer  =   require('multer');
var getMAC = require('getmac')
var cql = require('cassandra-driver');
var os = require('os');
var request = require('request');

port = 60785
hostName = "";

var cass_connection = new cql.Client({
	contactPoints: ['127.0.0.1'],
	keyspace : 'chatdb'
}) 

cass_connection.connect(function(err){
	if(err){console.log(err)}
		else console.log("Cass Connected");
})

var cassandra = cass_connection;

app.use(express.static("."))


 NAME = "";


getMAC.getMac(function(err,macAddress){
    if (err)  throw err
    console.log(macAddress)
})

app.get('/testReq' , function(req , res){

	var data = {name : "prajwal" , pass : "123"}

	 request.post(
    'http://localhost:3000/emp/location/update',
    { json: data },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
      }
    }
  );
})

app.get('/', function(req, res){
  res.sendFile(__dirname + '/chat2.html');
});

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
  	var timestamp = Date.now();
  	var fname = file.originalname.split('.');
  	for(i=0;i<(fname.length-1);i++){
  		var firstpart = firstpart + fname[i]; 
  	}
  	var secondpart = fname[fname.length-1];
  	var fileName = firstpart+"-"+timestamp +"."+ secondpart;
  	writeFileDetailsToCass(timestamp  , fileName , file.originalname , NAME);
    callback(null, fileName);
  }
});


var upload = multer({ storage : storage}).single('userPhoto');


io.on('connection', function(socket){
  	console.log('New connection from ' + NAME);
  	var newMessage = NAME + " joined the messenger ";
  	io.emit('serverchat message', newMessage);
    socket.on('clientchat message', function(msg){
  	MSG = NAME + " : " + msg
    io.emit('serverchat message', MSG);
  });
    socket.on('disconnect', function(){
    console.log(NAME + ' disconnected');
  });
});


app.post('/api/upload',function(req,res){
	hostName = req.protocol + '://' + req.get('host') + "/uploads"  
    upload(req,res,function(err) {
        if(err) {
		      console.log(err)
          return res.end("Error uploading file.");
        }
        res.redirect('/');
    });
});


app.post('/getLinks' , function(req , res){
	 var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
	 console.log(ip)
	 var query = 'SELECT * from links'
	 cassandra.execute(query , function(err , result){
	 if(err){console.log(err)}
	 var hostName = req.protocol + '://' + req.get('host') + "/uploads"
	 ResData = {dbData : result.rows , hostData : hostName }
	 res.send(ResData);
	})
})

function writeFileDetailsToCass(timeStamp , link , originalName , owner){
	var queryString = "INSERT INTO links (linkid , link , originalname , owner ) VALUES ( " + "'" + timeStamp + "'," + "'"+link + "'," + "'" + originalName +"'," + "'" + owner + "');"
	cassandra.execute(queryString , function(err , result){
		if(err){console.log(err)}
			console.log("File Details written to cass");
	})
}


http.listen(port, function(){
  console.log('listening on port : ' + port );
});
