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




    
     
      
  


app.listen({port:process.env.port||5000}, (err)=>{
  if ( err ) { return  console.log("Error");
  } else {
      console.log("http server runing on 5000 port");
  }
});