const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');
const port = 30020 // default port for the server to listen on

app.use(express.static('public'));
app.use(express.static('index.html')); 
app.use(bodyParser.json()); // use body-parser in order to read POST request data
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/log', function(req, res) { // post request at url /log to accept the user data
    req.body.data.forEach(function(line) { fs.appendFileSync('logdata.csv', line.join() + "\n"); }); // save the data line by line by appending to the logdata (if doesn't exist it will create one)
    res.redirect('/'); // redirect user back to the main page (refreshes)
});

app.listen(port, function() { // start server
    console.log(`SERVER: Listening on port ${port}!`);
	console.log(`SERVER: To shutdown the server use in conjunction Ctrl-C\n`);
});
