//Written By Souvik Das 07/02/18
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
var request = require("request");
var fs = require("fs");

const download2 = require('download');

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

var set_attributes = {};
var responseObject = {};
var responseText = {};
var googleText = "";

//Your Google API Key
var googleApiKey = "AIzaSyDZ5rIF_as0p3eJW08nKkQE2c0EFdmpG1w";

//Smarty Streets AuthId
var smartyStreetsAuthId = "eff0b523-c528-0292-6685-6ad2c5a6e92a";

//Smarty Streets Auth Token
var smartyStreetsAuthToken = "V7pWleHG8yLUS8CC7NqQ";

//Default Api
app.get('/', (req, res) => {
    res.send({
        "Status": "Welcome.. API up & running"
    });
});


// Main Api
app.post('/getAddressDetails', (req, res) => {

  var imgName = "/dist/s.jpg";

  function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

var base64str = base64_encode(__dirname + imgName);


  var options2={
      rejectUnauthorized: false
  }

  download2(req.body.imgurl,options2).then(data => {

  fs.writeFileSync('dist/card.jpg', data);



    var imageurl = req.body.imgurl;
    var tst=fs.createReadStream(__dirname + imgName);
    console.log(tst);

    var options = {
        method: 'POST',
        url: 'https://vision.googleapis.com/v1/images:annotate',
        qs: {
            key: googleApiKey
        },
        headers: {
            'postman-token': 'a728d8a5-472a-e211-42b1-95c9a2cd3c91',
            'cache-control': 'no-cache',
            'content-type': 'application/json'
        },
        body: {
            requests: [{
                image: {
                    // source: {
                    //     imageUri: imageurl
                    // }
                    //content:fs.createReadStream('dist/card.jpg')
                    content:base64str
                },
                features: [{
                    type: 'TEXT_DETECTION',
                    maxResults: 1
                }]
            }]
        },
        json: true
    };

    request(options, function(error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
        googleText = body.responses[0].textAnnotations[0].description;
        var options = {
            method: 'POST',
            rejectUnauthorized: false,
            url: 'https://us-extract.api.smartystreets.com/',
            qs: {
                'auth-id': smartyStreetsAuthId,
                'auth-token': smartyStreetsAuthToken
            },
            headers: {
                'cache-control': 'no-cache'
            },
            body: googleText
        };

        request(options, function(error, response, body) {
            if (error) throw new Error(error);

            //console.log(body.addresses[0].api_output[0].delivery_line_1);
            responseText = JSON.parse(body);
            //console.log(responseText.addresses[0].api_output[0].delivery_line_1);
            set_attributes.delivery_line = responseText.addresses[0].api_output[0].delivery_line_1;

            set_attributes.city_name = responseText.addresses[0].api_output[0].components.city_name;

            set_attributes.addstate = responseText.addresses[0].api_output[0].components.state_abbreviation;

            set_attributes.zipcode = responseText.addresses[0].api_output[0].components.zipcode;

            responseObject.set_attributes = set_attributes;
            console.log("Done....");
            res.send(responseObject);
        });

    });
})

})


//Get port from environment and store in Express.
const port = process.env.PORT || '3009';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
