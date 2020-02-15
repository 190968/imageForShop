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




const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), listFiles);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name}`);
      });
    } else {
      console.log('No files found.');
    }
  });
}

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
  res.render('view_image',{ url: app.locals.url, brand: brand, im: im,n: n});
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