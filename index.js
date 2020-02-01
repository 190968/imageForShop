var express = require("express");
var fs = require("fs");
var http = require("http");
var cors = require("cors");
var app = express();
app.use(cors());

var port = process.env.PORT||5000;

app.get("/",function(req,res) {
  console.log(req.query);
   let s =  fs.readdirSync((__dirname + "/items"));
   let n = req.query.number || 0;
   let im = s[n].replace(".jpg","");
   let next = s[1].replace(".jpg","");
   console.log(s);
   
    res.send(`<!doctype html>
    <html>
    <head>
    <style>
      a {
        margin: 20px;      
        display: inline-block;
        padding: 5px 20px;
        border: 1px solid #000;
        border-radius: 80px;
        font: 400 40px/40px "Arial",sans-serif;
        text-decoration: none;
        color: #000;
      }
      a:hover {
        background-color: #000;
        color: #fff;
      }
      @media screen and (max-width: 480px) {
        a {
          font: 400 40px/40px "Arial",sans-serif;
        }
      }
    </style>
    </head>
      <body>
        <div>
          <h1 id="one" align="center">
            <a href = http://localhost:5000/items/?brand=${s[0]}>${s[0]}</a>
            <a href = http://localhost:5000/items/?brand=${s[1]}>${s[1]}</a>
            <a href = http://localhost:5000/items/?brand=${s[2]}>${s[2]}</a>
            <a href = http://localhost:5000/items/?brand=${s[3]}>${s[3]}</a>
            <a href = http://localhost:5000/items/?brand=${s[4]}>${s[4]}</a>
            <a href = http://localhost:5000/items/?brand=${s[5]}>${s[5]}</a>
            <a href = http://localhost:5000/items/?brand=${s[6]}>${s[6]}</a>
            <a href = http://localhost:5000/items/?brand=${s[7]}>${s[7]}</a>
            <a href = http://localhost:5000/items/?brand=${s[8]}>${s[8]}</a>
            
          </h1>    
      </div>   
    </body>
    </html>
  `);
   
});

app.get("/items",function(req,res) {
  console.log(req.query.number);
  let brand = req.query.brand;
   let s =  fs.readdirSync((__dirname + `/items/${brand}`));
   let n = req.query.number || 0;
  
   let im = s[n].replace(".jpg","");
   
   console.log(s);
   
    res.send(`<!doctype html>
    <html>
    <head>
    <style>
      a {       
        display: inline-block;
        padding: 5px 10px;
        border: 1px solid #000;
        border-radius: 80px;
        font: 400 30px/30px "Arial",sans-serif;
        text-decoration: none;
        color: #000;
      }
      a:hover {
        background-color: #000;
        color: #fff;
      }
      b {
        display: inline-block;
        width: 200px;
        font-size: 30px;
      }
      @media screen and (max-width: 480px) {
        a {
          font: 400 40px/40px "Arial",sans-serif;
        }
      }
    </style>
    </head>
     
    <body>
    <div>
    
      <a href = http://localhost:5000/>main</a>
      <p align="center" >
        <a  href = http://localhost:5000/items/?brand=${brand}&number=${+n-1}>prev</a>
        <b >${im}</b>
        <a  href = http://localhost:5000/items/?brand=${brand}&number=${+n + 1}>next</a>
      </p>
      <img src = http://localhost:5000/items/${brand}/${im} 
        style="margin:0 auto;display:block;width: 80vw"
      >
    
   </div>
   
   </body>
   </html>
    `);
   
});
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
      
  


app.listen(port, (err)=>{
  if ( err ) { return  console.log("Error");
  } else {
      console.log("http server runing");
  }
});