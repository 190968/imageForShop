var express = require("express");
var fs = require("fs");
var http = require("http");
var path = require("path");
var cors = require("cors");
var formidable = require("formidable");
var Mongoclient = require("mongodb").MongoClient;
var app = express();
var nodemailer = require('nodemailer');


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



var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '19ham09@gmail.com',
    pass: '1q@W3e$R'
  }
});

app.get("/send_answer",(req,res)=>{
  var email = req.query.email;
  console.log(email);
  var name = req.query.name;
  var answer = req.query.answer;
  var mailOptions = {
    from: '19ham09@gmail.com',
    to: email,
    subject: 'This is answer from ALLforRUN.by',
    text: `<h1>Hello ${name} this is ALLforRUN.by. This is my answer ${answer} </h1>`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {

      Mongoclient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true },function(err, db){
        if ( err ) throw err;
        var dbo = db.db("my");       
          dbo.collection("questions").updateOne({ "email" : email },{$set:{"answer": answer}},{ upsert: true },(err)=>{
            if ( err ) throw err;
            const s = dbo.collection("questions").find().toArray((err,data)=>{
              if ( err ) throw err;
          

          res.render('question',{ base:data, url:app.locals.url });
        });
      });           
      });
    }
  });   
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
  let brand = req.query.brand;
  let model = req.query.model;
  let number = req.query.number; 
  let s =  fs.readdirSync((__dirname + "/items"));  
  res.render('upload_image',{exit: app.locals.url, brand: brand, folders: s, model: model,number: number} )
});  



app.post("/upload_image/uploadimage",(req,res)=>{  
  let brand = req.query.brand;
  let model = req.query.model;
  let number = req.query.number;
  console.log(`${brand}  and  ${model}`);   
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {   
    var oldpath = files.imageupload.path;
    var name = files.imageupload.name;
    var type = name.substr(name.indexOf('.'),20);
    console.log(model + number + type);

    var newpath = path.join( __dirname,'items',brand,model + number + type);

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


//connect to MongoDB

const uri = "mongodb+srv://alex:alex@cluster0alex-mvffj.gcp.mongodb.net/my?retryWrites=true";
// app.use(bodyParser.json({ inflate: true, limit: '2000kb', type: 'txt/csv'}));

// write to mongodb
app.post('/add_to_mongobase',(req,res)=>{
    Mongoclient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true },function(err, db){
        if ( err ) throw err;
        var dbo = db.db("my");
          fs.readFile(path.join(__dirname,'base.json'),'utf8',(err,data)=>{
           
            if ( err ) throw err;
            dbo.collection('base').insertMany( JSON.parse(data) , (err, res)=>{
                if ( err ) throw err;
                console.log(`inserted: ${res.insertedCount}`);
            });
        });
    });


});
//read questions from mongoDB

app.get("/question",function(req,res){
 
  Mongoclient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true },function(err, db){
    if ( err ) throw err;
    var dbo = db.db("my");       
    const s = dbo.collection("questions").find().toArray((err,data)=>{
      if ( err ) throw err;       
      res.render('question',{ base:data, url:app.locals.url });
    });           
  });
});


//read base from mongoDB

app.all("/readBase",function(req,res){
  let brand = req.query.brand; 
  Mongoclient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true },function(err, db){
    if ( err ) throw err;
    var dbo = db.db("my");       
    const s = dbo.collection("base").find({ "brand" : brand }).toArray((err,data)=>{
      if ( err ) throw err;       
      res.render('base_brand',{ base:data, url:app.locals.url, brand:brand });
    });           
  });
});

//add item to base
app.get("/add_to_base_item",function(req,res){
  let id = 1000;
  let brand = req.query.brand;
  let model = req.query.model;
  let gender = req.query.gender;
  let color = req.query.color;
  let size = req.query.size;
  let cost = req.query.cost;
  let sale = req.query.sale;
  Mongoclient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true },function(err, db){
    if ( err ) throw err;
    var dbo = db.db("my");
    var set = { "id" : +id ,
              "cost": +cost,
              "sale": +sale,
              "brand": brand,
              "model": model,
              "gender": gender,
              "color": color,
              "size": size             
            };       
    dbo.collection("base").insertOne(set,(err,date)=>{
      if ( err ) throw err;
      console.log(date);       
      res.redirect(`/readBase?brand=${brand}`);
    });           
  });
});

//add question to mongoDB

app.get("/write_question",function(req,res){
 
  let name = req.query.name;
  let email = req.query.email;
  let question = req.query.question;
  Mongoclient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true },function(err, db){
    if ( err ) throw err;
    var dbo = db.db("my");
    var set = { 
              "date": new Date,
              "name": name,
              "email": email,
              "question": question,
            };       
    dbo.collection("questions").insertOne(set,(err,date)=>{
      if ( err ) throw err;        
      res.send("good");
    });           
  });
});


//update item in base
app.get("/write_to_base",function(req,res){
  let id = req.query.id;
  let brand = req.query.brand;
  let cost = req.query.cost;
  let sale = req.query.sale;
  Mongoclient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true },function(err, db){
    if ( err ) throw err;
    var dbo = db.db("my");       
    dbo.collection("base").updateOne({ "id" : +id },{$set:{"cost": +cost,"sale": +sale}},{ upsert: true },
    (err,date)=>{
      if ( err ) throw err;
      console.log(date.result.nModified);       
      res.redirect(`/readBase?brand=${brand}`);
    });           
  });
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