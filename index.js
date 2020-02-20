var express = require("express");
var fs = require("fs");
var http = require("http");
var path = require("path");
var cors = require("cors");
var app = express();
var formidable = require("formidable");

const readline = require('readline');
const {google} = require('googleapis');
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
//  Main page
app.get("/",function(req,res) {
  app.locals.url =  port == 5000 ? req.protocol +'://' + req.hostname +  `:${port}`:
    req.protocol +'://' + req.hostname; 
  let s =  fs.readdirSync((__dirname + "/items")); 
  res.render('main_page',{ folders: s, url: app.locals.url});
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

// pug form  for upload image
app.get("/upload_image",(req,res)=>{ 
  app.locals.brand = req.query.brand; 
  let s =  fs.readdirSync((__dirname + "/items"));  
  res.render('image',{exit: app.locals.url, brand: app.locals.brand, folders: s} )
});  



app.post("/upload_image/uploadimage",(req,res)=>{  
  let brand = req.query.brand;
  console.log(brand);   
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {   
    var oldpath = files.imageupload.path;
    var newpath = path.join( __dirname,'items',app.locals.brand,files.imageupload.name);

    fs.copyFile(oldpath, newpath, function (err) {   
      if (err) {
        res.send(`<h1>${err}</h1>`)
      } else {
        res.redirect("/");
      }     
    })

  });

});

// Rename folder

app.get("/rename",(req,res)=>{
  let name = req.query.name;
  let last_name = req.query.last_name;
   fs.rename(path.join(__dirname,'items',last_name),path.join(__dirname,'items',name),(err)=>{
    if (err) throw err
    res.redirect('/');
  }) 
});




//uploadBase

app.post("/uploadBase",(req,res)=>{  
 
    var url =  port == 5000 ? req.protocol +'://' + req.hostname +  `:${port}`:
              req.protocol +'://' + req.hostname;
 
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


// pug form  for upload base
app.get("/upload_base",(req,res)=>{ 
  
  res.render('upload_base',{exit: app.locals.url} )
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
  res.render('view_image',{ url: app.locals.url, brand: brand, im: im,n: n, image: s});
});  
    
  
   


//  request for send files to site
app.all("/items/*", function(req,res,err) {
    var path = req.path;
    var url =  port == 5000 ? req.protocol +'://' + req.hostname +  `:${port}`:
              req.protocol +'://' + req.hostname;
  

    var s = fs.existsSync(__dirname +  path + ".jpg");  
    s ? 
    res.sendFile(__dirname +  path + ".jpg")
    :   
    res.sendFile(__dirname +  path + ".webp"); 
   
});

// delete image
app.get("/delete",function(req,res){
  let brand = req.query.brand; 
  let name = req.query.name; 
  fs.unlink((__dirname + `/items/${brand}/${name}`),function(err){
    if (err) throw err;
    res.redirect("/");
    console.log(`file ${name} deleted`);
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