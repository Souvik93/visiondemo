//Written By Souvik Das 07/02/18

const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const download = require('image-downloader');

const download2 = require('download');
var download1 = require('download-file');

var furl = "http://i.imgur.com/G9bDaPH.jpg";

var resultOp;
var token;
var token_type;

var set_attributes = {};

var responseObject = {};

var responseText={};

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

var fs = require("fs");
var request = require("request");

var strm = "https://img2.carmax.com/stock/mm-honda-accord/500";

var googleText="";

//Default Api
app.get('/', (req, res) => {
    res.send({
        "Status": "Welcome.. API up & running"
    });
});

var googleApiKey="AIzaSyDZ5rIF_as0p3eJW08nKkQE2c0EFdmpG1w";

app.post('/getAddressDetails',(req,res)=>
{

  var imageurl= req.body.imgurl;

  var options = { method: 'POST',
    url: 'https://vision.googleapis.com/v1/images:annotate',
    qs: { key: googleApiKey },
    headers:
     { 'postman-token': 'a728d8a5-472a-e211-42b1-95c9a2cd3c91',
       'cache-control': 'no-cache',
       'content-type': 'application/json' },
    body:
     { requests:
        [ { image: { source: { imageUri: imageurl} },
            features: [ { type: 'TEXT_DETECTION', maxResults: 1 } ] } ] },
    json: true };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

console.log(body);
      googleText = body.responses[0].textAnnotations[0].description;

        console.log(body.responses[0].textAnnotations[0].description);


        var options = { method: 'POST',
        rejectUnauthorized: false ,
  url: 'https://us-extract.api.smartystreets.com/',
  qs:
   { 'auth-id': 'eff0b523-c528-0292-6685-6ad2c5a6e92a',
     'auth-token': 'V7pWleHG8yLUS8CC7NqQ' },
  headers:
   { 'postman-token': '67c2d6f4-05fb-bda3-0841-235223e08ae2',
     'cache-control': 'no-cache' },
  body: googleText};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  //console.log(body.addresses[0].api_output[0].delivery_line_1);
  responseText=JSON.parse(body);
  console.log(responseText.addresses[0].api_output[0].delivery_line_1);

    set_attributes.delivery_line=responseText.addresses[0].api_output[0].delivery_line_1;

    set_attributes.city_name=responseText.addresses[0].api_output[0].components.city_name;

    set_attributes.state=responseText.addresses[0].api_output[0].components.state_abbreviation;

      set_attributes.zipcode=responseText.addresses[0].api_output[0].components.zipcode;

    responseObject.set_attributes=set_attributes;
    res.send(responseObject);
});

  });

})


//Get port from environment and store in Express.
const port = process.env.PORT || '3009';
app.set('port', port);
//Initialize Token Type & Token No
//getToken();

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
