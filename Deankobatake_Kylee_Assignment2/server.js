//Assignment 2, Kylee Dean-Kobatake
//Below is code extracted from Lab13, excercise 4 with slight modifications
//Big thanks to Professor Port for the guidance he provided 

//Below is code copied from Lab13
var data = require('./public/product_data.js'); // This puts the product_data.js data into a variable called data 
var products = data.products; // This puts the product data into a variable called products
const querystring = require('querystring'); //loads the querystring module in variable querystring
var express = require('express'); // Starts express
var app = express(); // Puts express in variable app
var myParser = require("body-parser"); //loads body-parser module in variable myParser
var fs = require('fs');

// catches all incoming requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);//type in console the request method and request path
    next(); //move on
});

app.use(myParser.urlencoded({ extended: true })); //use myParser for the url

//Code below was made with guidance from Professor Port
app.post("/process_order", function (request, response) {
    var POST = request.body; //put quantity_form POST data into variable called POST

    if (typeof POST['submitPurchase'] != 'undefined') { //if submit button is pressed

        let hasqty = false;
        let hasErrors = false; // assume no errors to begin with

        for (i in products) { //validate each quantity 
            qty = POST[`quantity${i}`];

            if (qty != '' && isNonNegIntString(qty) == false) { //check if quantity is not empty & non negative integer
                hasErrors = true;
            }

            if (qty > 0) { //check to see if user selected any quantities
                hasqty = true;
            }
        }
        //if no errors, pass quantity data to user login page, otherwise go back to display page
        var stringified = querystring.stringify(POST);
        if (hasqty == true && hasErrors == false) {
            console.log(stringified); // log quantities
            response.redirect("./user_login.html?" + stringified); //redirect to user_login page
        }
        else { //if no quantity inputted or invalid quantity, notify user and send them back to display
            alertstr = `<script> alert("Error! You need to select a item or enter valid quantities");
                        window.history.back() </script>`;

            response.send(alertstr); // send alert
        }
    }
});

const user_data_filename = 'userdata.json'; // assign userdata.json to user_data_filename
var data = fs.readFileSync(user_data_filename, 'utf-8'); // reads the data in user_data_filename and puts it into data variable
users_data = JSON.parse(data); // parses data variable into JSON them passes it into users_reg_data

//This takes the login info from login_form on user_login.html, checks if user exists in userdata.json, if they do then redirect to invoice. 
app.post("/process_login", function (request, response) {
    console.log(request);
    if (typeof users_data[request.body.username] != 'undefined') { //if username matches stored username in userdata.json
        if (request.body.password != users_data[request.body.username].password) { //if the password matches the stored password
        
            alertstr = `<script> alert("Password is incorrect!");
            window.history.back() </script>`;
    
            response.send(alertstr); // send alert
    
        } else {
            string_with_quantities = request.query;
            string_with_username = request.body;
            console.log(request);
            
            response.redirect("./invoice.html?" + querystring.stringify(string_with_quantities) + "&" + querystring.stringify(string_with_username)); // 
        }
        
    } else {
        alertstr = `<script> alert("User does not exist! Please register.");
        window.history.back() </script>`;

        response.send(alertstr); // send alert
    }


});




//This processes registration info, if data is valid then write data to file, then redirect to invoice
app.post("/process_register", function (request, response) {

    let POST = request.body;
    var errors = [];
    //errors.push(POST);

    //username validation
    if (typeof users_data[request.body.newuser] != 'undefined') {
       errors.push("Username exists!")
    }
    if (request.body.newuser.length < 4) {
        errors.push("Username is too short!");
    }

    if (request.body.newuser.length > 25) {
        errors.push("Username is too long!");
    }

    if ((/^[0-9a-zA-Z]+$/).test(request.body.newuser) == false) { // got the (/^[0-9a-zA-Z]+$/) from w3resource.com
        errors.push("Username can only contain letters or numbers!");
    }

    //full name validation
    if (request.body.newfullname.length > 30) {
        errors.push("Name is too long!");
    }

    if (/^[A-Za-z]+$/.test(request.body.name)) { //No response if name is okay
    } else { //code from Justina
        errors.push("Name can only contain letters!");
    };
    //password validation
    if (request.body.newpass.length < 6) {
        errors.push("Password is too short!");
    }

    //confirm password validation
    if (request.body.newpass != request.body.newpass_confirm) {
        errors.push("Password confirmation does not match!");
    }

    if (errors.length == 0) { //if there's no errors in registration data validation
        let POST = request.body;

        //send data to userdata.json to be stored
        username = POST['newuser'];
        users_data[username] = {};
        users_data[username].name = POST['newfullname'];
        users_data[username].password = POST['newpass'];
        users_data[username].email = POST['newemail'];
        reg_info_str = JSON.stringify(users_data); //parse and store new user data in reg_info_str
        fs.writeFileSync(user_data_filename, reg_info_str, "utf-8");
        string_with_quantities = request.query;
        console.log(request);

        response.redirect("./invoice.html?" + querystring.stringify(string_with_quantities)) // write to userdata.json file 
    } else {
        //if (errors.length > 0){ // if there's a problem, display this alert and go back to login page
        console.log(errors);
        alertstr = `<script> alert("There seems to be a registration error.");
        window.history.back() </script>`;

        response.send(alertstr);//send alert
    }
});

// IGNORE THE CODE BELOW, WIP

//this needs to make sure that there's no empty user/name/pass/email is submitted.
/*let POST = request.body;
if (POST['newuser'] == [" "]) {
    alertstr = `<script> alert("Oops! You need to finish filling out the form!");
    window.history.back() </script>`;

    response.send(alertstr); // if there's a empty value, send alert and send back 
} else {
    response.redirect("./invoice.html"); // if registration is good, send to invoice
};*/


//function to check if user exists in user_data.json file
/*function does_user_exist() {
    let check_for_user = fs.readFileSync(user_data.JSON, 'utf-8');
    console.log(check_for_user);
};*/

// IGNORE THE CODE ABOVE, WIP

//Function below is from ITM352 Lab12, checks if quantities entered are a number, non-negative, and an integer
function isNonNegIntString(string_to_check, returnErrors = false) {
    errors = []; // assume no errors at first
    if (Number(string_to_check) != string_to_check) { errors.push('Not a number!'); } // Check if string is a number value
    if (string_to_check < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (parseInt(string_to_check) != string_to_check) errors.push('Not an integer!'); // Check that it is an integer

    return returnErrors ? errors : (errors.length == 0);
}


app.use(express.static('./public')); //Searchs for files in the public directory 
app.listen(8080, () => console.log(`listening on port 8080`)); // starts listening for requests on port 8080