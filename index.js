var express = require("express");
var fs = require("fs");
var http = require("http");
var path = require("path");
var cors = require("cors");
var app = express();
var formidable = require("formidable");
app.use(cors());

const port = process.env.PORT||5000;

app.get("/",function(req,res) {
  let url = req.protocol +'://' + req.hostname + ":" + `${port}`;
 
  let s =  fs.readdirSync((__dirname + "/items")); 
  
   
  res.send(`<!doctype html>
    <html>
    <head>
      <title>my Site</title>
      <style>
        a {
          box-shadow:inset 0 0 5px 5px #ddd; 
          margin: 20px;      
          display: inline-block;
          padding: 5px 20px;
          border: 2px solid #000;
          border-radius: 80px;
          font: 400 40px/45px "Arial",sans-serif;
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
        div,
        body {
          background-color: #00ffff;
        }
      </style>
    
    </head>
      <body>
        <div>
       
          <h1 id="one" align="center">
            <a href = ${url}/items/?brand=${s[0]}>${s[0]}</a>
            <a href = ${url}/items/?brand=${s[1]}>${s[1]}</a>
            <a href = ${url}/items/?brand=${s[2]}>${s[2]}</a>
            <a href = ${url}/items/?brand=${s[3]}>${s[3]}</a>
            <a href = ${url}/items/?brand=${s[4]}>${s[4]}</a>
            <a href = ${url}/items/?brand=${s[5]}>${s[5]}</a>
            <a href = ${url}/items/?brand=${s[6]}>${s[6]}</a>
            <a href = ${url}/items/?brand=${s[7]}>${s[7]}</a>
            <a href = ${url}/items/?brand=${s[8]}>${s[8]}</a>
            <a>add</a>
          </h1>    
      </div>

    </body>   
    </html>
  `);
   
});

app.get("/items",function(req,res) { 
  let url = req.protocol +'://' + req.hostname + ":" + `${port}`;
  let brand = req.query.brand;
  let s =  fs.readdirSync((__dirname + `/items/${brand}`));
  let num = req.query.number || 0;
  let n = num < 0 ? 0 : num > s.length-1 ? s.length-1 : num; 
  let im = s[n].replace(".jpg","").replace(".webp","");   
  res.send(`<!doctype html>
    <html>
    <head>
    <style>
      a {
        box-shadow:inset 0 0 5px 5px green;        
        display: inline-block;
        padding: 10px 20px;
        border: 2px solid #red;
        border-radius: 90px;
        font: 400 20px/30px "Arial",sans-serif;
        text-decoration: none;
        color: #000;
      }
      a:hover {
        background-color: #000;
        color: #fff;
        transition: all 0.5s;
      }
      b {
        display: inline-block;
        width: 300px;
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
    
      <a href = ${url}/>EXIT</a>
      <a href = ${url}/upload/?brand=${brand}>UPLOAD IMAGE</a>
      <p align="center" >
        <a  href = ${url}/items/?brand=${brand}&number=${+n-1}>prev</a>       
        <a  href = ${url}/items/?brand=${brand}&number=${+n + 1}>next</a>
      </p>
      <p align="center">     
        <b>${im}</b>     
      </p>
      <img src = ${url}/items/${brand}/${im} 
        style="margin:0 auto;display:block"
      >
     
    
   </div>
   
   </body>
   </html>
    `);
   
});
app.all("/items/*", function(req,res,err) {
    var path = req.path;
    let url = req.protocol +'://' + req.hostname + ":" + `${port}`;
    let s = fs.existsSync(__dirname +  path + ".jpg");  
    s ? 
    res.sendFile(__dirname +  path + ".jpg"):   
    res.sendFile(__dirname +  path + ".webp"); 
   
});


app.get("/base", function(req,res) {    
     fs.readFile("base.json", function(err,data) { 
         if (err) throw err;       
        res.send(data);
    });
});

app.get("/upload",function(req,res){ 
  let url = req.protocol +'://' + req.hostname + ":" + `${port}`;
  let brand = req.query.brand; 
  res.send(`
  <!doctype html>
  <html>
  <head>
  <style>
    input,a {
      box-shadow:inset 0 0 5px 5px green;        
      display: block;
      padding: 10px 20px;
      border: 2px solid #red;
      border-radius: 90px;
      margin: 20px auto;
      font: 400 20px/30px "Arial",sans-serif;
      cursor: pointer;
      color: #000;
    }
    a {
      width: 100px;
      text-align: center;
      text-decoration: none;
    }
    input:hover,
    a:hover {
      background-color: #000;
      color: #fff;
      transition: all 0.5s;
    }
   
    @media screen and (max-width: 480px) {
      input {
        font: 400 40px/40px "Arial",sans-serif;
      }
    }
  </style>
  </head>
   
  <body>
    <div>
      <form action="fileupload/?brand=${brand}" method="post" enctype="multipart/form-data">
        <input type="file" name="filetoupload">
        <input type="submit">
      </form>
      <a href = ${url}/>EXIT</a>
    </div>
  </body>
  </html>  
    
  `)
}); 
app.post("/upload/fileupload",function(req,res){ 
  let url = req.protocol +'://' + req.hostname + ":" + `${port}`;
  let brand = req.query.brand;  
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.path;
    var newpath = path.join( __dirname,'items',`${brand}`,files.filetoupload.name);
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      res.write(`
        <h1>File uploaded to ${brand} directory 
        <a href = ${url}/>EXIT</a></h1>
      `);
      res.end();
    });
  });  
});       
      
  


app.listen(port, (err)=>{
  if ( err ) { return  console.log("Error");
  } else {
      console.log("http server runing");
  }
});