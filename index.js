var express = require("express");
var fs = require("fs");
var http = require("http");
var cors = require("cors");
var app = express();

app.use(cors());





app.all("/items/*", function(req,res,err) {
      var path = req.path;
      res.sendFile(__dirname +  path + ".jpg");
     
 
});


app.get("/bob", function(req,res) {    
     fs.readFile("base.json", function(err,data) { 
         if (err) throw err;
       
        res.send(data);
    });
});




    
     
      
  
const port = process.env.PORT || 5000;

http.createServer(app).listen(port, function(){console.log("Server running on 5000 port")});