var express = require("express");
var fs = require("fs");
var http = require("http");
var path = require("path");
var cors = require("cors");
var app = express();
var formidable = require("formidable");
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});



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
        .folders a {
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
        .add_folder {
          box-shadow:inset 0 0 5px 5px #ccc; 
          margin: 20px;      
          display: inline-block;
          padding: 5px 20px;
          border: 2px solid red;
         
          font: 400 20px/25px "Arial",sans-serif;
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
       
          <div class="folders" align="center">
            <a href = ${app.locals.url}/items/?brand=${s[0]}>${s[0]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[1]}>${s[1]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[2]}>${s[2]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[3]}>${s[3]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[4]}>${s[4]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[5]}>${s[5]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[6]}>${s[6]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[7]}>${s[7]}</a>
            <a href = ${app.locals.url}/items/?brand=${s[8]}>${s[8]}</a>
           
          </div>
          <a class="add_folder" href = ${app.locals.url}/createFolder>create new folder</a>
          <a class="add_folder" href = ${app.locals.url}/upload>add base</a>      
      </div>

    </body>   
    </html>
  `);
   
});

//pug CreateFolder
app.get("/createFolder",(req,res)=>{
  let name = req.query.name;
  if (name == undefined) {
  res.render('pug',{exit: app.locals.url} )
  } else {
    fs.mkdir((__dirname + `/items/${name}`),function(err){
      if (err) {

        res.send(`<h1>${err}</h1>`)

      } else {
        res.redirect("/");
      }  
     
    })

  }
});
//uploadBase
// app.use(bodyParser.json({ inflate: true, limit: '2000kb',type: 'image/*'}));
app.post("/uploadBase",(req,res)=>{
  // const buf = Buffer.from(req.body.file,'base64');
  let name = req.query.name; 
    var url =  port == 5000 ? req.protocol +'://' + req.hostname +  `:${port}`:
              req.protocol +'://' + req.hostname;
  // var brand = req.query.brand;  
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
   
    var oldpath = files.filetoupload.path;
    var newpath = path.join( __dirname,files.filetoupload.name);

    fs.copyFile(oldpath, newpath, function (err) {   
      if (err) {
        res.send(`<h1>${err}</h1>`)
      } else {
        res.redirect("/");
      }     
    })

  });

});

// pug form  for upload
app.get("/upload",(req,res)=>{  
  res.render('base',{exit: app.locals.url} )
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
        box-shadow:inset 0 0 10px 2px green;        
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
        <a>delete file</a>
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
  console.log("send data");   
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