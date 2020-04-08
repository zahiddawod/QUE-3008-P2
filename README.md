# Quantitative Usability Evaluation COMP3008A Project 2

<h1>New Password Scheme Server</h1>
The server/ folder contains the source code for hosting the node server and for the password scheme.

<h2>Prerequisites</h2>
Versions of npm and node that were tested when building this app:
npm -v 6.7.0
node -v 11.14.0

<h2>File list</h2>

 - app.js: The main javascript file that starts the express server

 - package.json: Contains all the dependencies required for the server to work as well as other metadata and releveant information about the project

 - index.html: Is the main html page that is served when the client visits the site

 - index.js: Holds the logic behind manipulating the HTML elements and password scheme

 - style.css: Stylesheet for the main page with classes for different states.

<h2>How to use</h2>
Install the modules:

- npm install

Run the program:

- npm run test

The server will be hosted on port 30020 and can be visited at http://localhost:30020

<h1>Python CSV Parser</h1>
The py-csv-parser/ folder contains the source code for the python file that extracts and parses the CSV files given on culearn.

<h2>Prerequisites</h2>
You will need Python 3.x.x for this program to work.

<h2>File list</h2>
 - CSVParser.py: The main program that parses the CSV files

<h2>How to use</h2>
Ensure you have the required text21 and image21 CSV files in the same directory as the script.
Execute with `py CSVParser.py` and then the script will output a new CSV file named output-data.csv