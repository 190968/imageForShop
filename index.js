var express = require("express");
var fs = require("fs");
var http = require("http");
var path = require("path");
var cors = require("cors");
var app = express();
var formidable = require("formidable");



app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

app.use(cors());

const port = process.env.PORT||5000;

app.get("/",function(req,res) {
  app.locals.url =  port == 5000 ? req.protocol +'://' + req.hostname +  `:${port}`:
                  req.protocol +'://' + req.hostname;

 
 
 
  let s =  fs.readdirSync((__dirname + "/items")); 
  
  //  Main page
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
        div {
          margin-top: 25vw;
        }
        @media only screen and (max-device-width: 480px) {
          a {
            padding: 15px 30px;
            font: 400 50px/50px "Arial",sans-serif;
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
            <a href = ${app.locals.url}/items/?brand=${s[0]}>${s[0]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[1]}>${s[1]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[2]}>${s[2]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[3]}>${s[3]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[4]}>${s[4]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[5]}>${s[5]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[6]}>${s[6]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[7]}>${s[7]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[8]}>${s[8]}</a>
            <a>add</a>
          </h1>    
      </div>

    </body>   
    </html>
  `);
   
});
// Page with image
app.get("/items",function(req,res) { 

  let brand = req.query.brand;
  let s =  fs.readdirSync((__dirname + `/items/${brand}`));
  console.log(s);
  let num = req.query.number || 0;
  let n = num < 0 ? 0 : num > s.length-1 ? s.length-1 : num;
  let to_del = s[n]; 
  let im = s.length !== 0 ? s[n].replace(".jpg","").replace(".webp","") : s[1];   
  res.send(`<!doctype html>
    <html>
    <head>
    <style>
      body {
        background-color:  #00ffff;
      }
      a {
        box-shadow:inset 0 0 5px 5px green;        
        display: inline-block;
        padding: 10px 20px;
        border: 2px solid #red;
        vertical-align: middle;
        border-radius: 90px;
        font: 400 20px/30px "Arial",sans-serif;
        text-decoration: none;
        color: #000;
        margin: 10px;
      }
      a:hover {
        background-color: #000;
        color: #fff;
        transition: all 0.5s;
      }
      b {
        display: inline-block;
        width: auto;
        font-size: 30px;
      }
      img {
        display: inline-block;
        
        width: 50%;
        vertical-align: middle;
      }
      a.delete {
        visibility: hidden;
      }
      .del_block {
        cursor: pointer;
      }
      p:hover a.delete {
        transition: all 1s;
        visibility: visible;
      }
      @media (max-device-width: 480px) {
        a {
          padding: 15px 30px;
          font: 400 40px/40px "Arial",sans-serif;
        }
        img {
          margin-top: 10vw;
          width: 100%;
        }
      }
    </style>
    </head>
     
    <body>
    <div>
      <p align="center" >
        <a href = ${app.locals.url}/>EXIT</a>
        <a href = ${app.locals.url}/upload/?brand=${brand}>UPLOAD IMAGE</a>     
       
        <b>${im}</b>           
        <span class="del_block">delete file</span>
        <a  class = "delete" href = ${app.locals.url}/items/?brand=${brand}&number=${n}>no</a> 
        <a  class = "delete" href = ${app.locals.url}/delete/?brand=${brand}&name=${to_del}>yes</a>
      </p>
      <p align="center">
        <a  href = ${app.locals.url}/items/?brand=${brand}&number=${+n-1}>prev</a>
        <img src = ${app.locals.url}/items/${brand}/${im} alt ="no image">
        <a  href = ${app.locals.url}/items/?brand=${brand}&number=${+n + 1}>next</a>
      </p>
      <p align="center"> 

      </p>
     
    
   </div>
   
   </body>
   </html>
    `);
   
});

//  request for send files to site
app.all("/items/*", function(req,res,err) {
    var path = req.path;
    var url =  port == 5000 ? req.protocol +'://' + req.hostname +  `:${port}`:
              req.protocol +'://' + req.hostname;
  

    var s = fs.existsSync(__dirname +  path + ".jpg");  
    s ? 
    res.sendFile(__dirname +  path + ".jpg"):   
    res.sendFile(__dirname +  path + ".webp"); 
   
});

// delete image
app.get("/delete",function(req,res){
  let brand = req.query.brand; 
  let name = req.query.name; 
  fs.unlink((__dirname + `/items/${brand}/${name}`),function(err){
    if (err) throw err;
    console.log(`file $[name] deleted`);
  });
});

// page response base
app.get("/base", function(req,res) {    
     fs.readFile("base.json", function(err,data) { 
         if (err) throw err;       
        res.send(data);
    });
});

// page for upload files
app.get("/upload",function(req,res){ 
  let url =  port == 5000 ? req.protocol +'://' + req.hostname +  `:${port}`:
              req.protocol +'://' + req.hostname;
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
  
  var url =  port == 5000 ? req.protocol +'://' + req.hostname +  `:${port}`:
              req.protocol +'://' + req.hostname;
  var brand = req.query.brand;  
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