const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');
const port = 30020

app.use(express.static('public'));
app.use(express.static('index.html'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/log', function(req, res) {
    req.body.data.forEach(function(line) { fs.appendFileSync('logdata.csv', line.join() + "\n"); });
    res.redirect('/');
});

app.listen(port, function() {
    console.log(`SERVER: Listening on port ${port}!`);
	console.log(`SERVER: To shutdown the server use in conjunction Ctrl-C\n`);
});
