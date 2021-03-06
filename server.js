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

    var imgName = "/dist/card.jpg";

    function base64_encode(file) {
        // read binary data
        var bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return new Buffer(bitmap).toString('base64');
    }




    var options2 = {
        rejectUnauthorized: false
    }

    download2(req.body.imgurl, options2).then(data => {

        fs.writeFileSync('dist/card.jpg', data);


        //var base64str = base64_encode(__dirname + imgName);
        var imageurl = req.body.imgurl;
        var tst = fs.createReadStream(__dirname + imgName);
        //console.log(tst);

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
                        content: base64_encode(__dirname + imgName)
                    },
                    features: [{
                        type: 'TEXT_DETECTION',
                        maxResults: 1
                    }]
                }]
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) {
                set_attributes.jsonAPIError = "Yes";
                responseObject.set_attributes = set_attributes;
                res.send(responseObject);
            }
            console.log("Output From Google Vision");
            console.log(body.responses[0].textAnnotations[0].description);
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

            request(options, function (error, response, body) {
                if (error) {
                    set_attributes.jsonAPIError = "Yes";
                    responseObject.set_attributes = set_attributes;
                    res.send(responseObject);
                }

                //console.log(body.addresses[0].api_output[0].delivery_line_1);
                responseText = JSON.parse(body);
                console.log("From Smarty Street Api");
                console.log(responseText);
                if (responseText.addresses[0] == undefined || responseText.addresses[0].api_output[0] == undefined) {
                    console.log("Failed.. Not an US Address");
                    set_attributes.jsonAPIError = "Yes";
                    responseObject.set_attributes = set_attributes;
                    res.send(responseObject);
                }

                else {

                    var pattern = /\S+@\S+\.\S+/;
                    var phnPattern=/((?:\+|00)[17](?: |\-)?|(?:\+|00)[1-9]\d{0,2}(?: |\-)?|(?:\+|00)1\-\d{3}(?: |\-)?)?(0\d|\([0-9]{3}\)|[1-9]{0,3})(?:((?: |\-)[0-9]{2}){4}|((?:[0-9]{2}){4})|((?: |\-)[0-9]{3}(?: |\-)[0-9]{4})|([0-9]{7}))/;
                    var match = pattern.exec(googleText);
                    var phnMatch=phnPattern.exec(googleText);

                    if (match == null) {
                        set_attributes.email = "Not Found";
                    }
                    else {
                        set_attributes.email = match[0];
                    }

                    if(phnMatch==null)
                    set_attributes.phone="Not Found";
                    else
                    set_attributes.phone=phnMatch[0];




                    //console.log(responseText.addresses[0].api_output[0].delivery_line_1);
                    set_attributes.jsonAPIError = "No";
                    set_attributes.delivery_line = responseText.addresses[0].api_output[0].delivery_line_1;

                    set_attributes.city_name = responseText.addresses[0].api_output[0].components.city_name;

                    set_attributes.addstate = responseText.addresses[0].api_output[0].components.state_abbreviation;

                    set_attributes.zipcode = responseText.addresses[0].api_output[0].components.zipcode;

                    responseObject.set_attributes = set_attributes;
                    console.log("Done....");
                    res.send(responseObject);
                }
            });

        });
    })
        .catch((err) => {
            //console.log(err);
            set_attributes.jsonAPIError = "Yes";
            responseObject.set_attributes = set_attributes;
            res.send(responseObject);
        });

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
