var svg = document.getElementById("inputPattern");
var point = svg.createSVGPoint();
var prevSelectedDot, currentDrawLine; // keep track of last selected dot and the current draw line in order to update draw onmousemove event
var selected = []; // an aray of the user's input of what dots they selected
var passwords = [["Email", "", false, 3], ["Banking", "", false, 3], ["Shopping", "", false, 3]]; // where to store the generated passwords and number of attempts as well as whether or not they've tested the password for this current service
var currentIndex = 0, randomIndex = -1; // currentIndex is to keep track of which service we are generating the password for, and randomIndex is to keep track of which one we are being tested on (randomly selected) 
var generatedPassword = []; // the currently generated password
var acceptInput = true; // flag that determines if user can interact with the input grid
var csvData = []; // list to store the log data

// generate random user id
var user = 'User_' + Math.floor(Math.random() * 10000000);
document.getElementById('staticUser').value = user;

// updates the title at the top to indicate which service we are on and if we are creating or authenticating
function UpdateTitle(index, action) {
    document.getElementById("title").innerHTML = "<h1>" + passwords[index][0] + " (" + action + ")</h1>";
}

UpdateTitle(currentIndex, "Create"); // start title at email and create

// function that draws an svg elment with specified attributes (dot, line)
function DrawSVGElement(elem, attributes) {
    var d = document.createElementNS('http://www.w3.org/2000/svg', elem);
    for (var k in attributes)
        d.setAttribute(k, attributes[k]);
    return d;
}

// draw the predifined dots for both grids
for (var x = 0; x < 5; x++) {
    for (var y = 0; y < 4; y++) {
        document.getElementById("dots").appendChild(DrawSVGElement("circle", {id: "dot" + x + "" + y, cx: (x + 1) * 25, cy: (y + 1) * 30, r: 2}));
        document.getElementById("g-dots").appendChild(DrawSVGElement("circle", {id: "g-dot" + x + "" + y, cx: (x + 1) * 25, cy: (y + 1) * 30, r: 2}));
    }
}

// function to log the user's current action
function log(action) {
    var date = new Date();
    var dateString = date.getFullYear() + "-" + ((date.getMonth() < 9) ? "0" : "") + (date.getMonth() + 1) + "-" + ((date.getDate() < 10) ? "0" : "") + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + ((date.getSeconds() < 10) ? "0" : "") + date.getSeconds();
    csvData.push([dateString, user, (currentIndex >= 3) ? "Authentication" : "Create", passwords[((currentIndex >= 3) ? randomIndex : currentIndex)][0], action]);
}

// generates a new random pattern (password)
function GeneratePattern() {
    log("Generate"); // log that the user did this
    $("#nextbtn").attr("disabled", true); // disable the next button since we want the user to be able to complete the password at least once before moving on
    ResetInput(); // erase what they've selected so far on the grid
    generatedPassword = []; // reset the generated password
    // erase the grid that shows the given pattern
    document.getElementById("g-active").innerHTML = "";
    document.getElementById("g-lines").innerHTML = "";
    for (let i = 0; i < 5; i++) { // get 5 randomly unique dots on the grid
        var selectedDot;
        do { selectedDot = "dot" + Math.floor(Math.random() * 5) + "" + Math.floor(Math.random() * 4); } while(generatedPassword.includes(selectedDot)); // generate unique id
        generatedPassword.push(selectedDot); // update generated password with newly selected dot
        // draw pattern as dots are being randomly selected
        var dotInHTML = document.getElementById(("g-" + selectedDot)); 
        document.getElementById("g-active").appendChild(DrawSVGElement("circle", { cx: dotInHTML.attributes.cx.value, cy: dotInHTML.attributes.cy.value, r: 5}));
    }
    for (let i = 0; i < generatedPassword.length-1; i++) { // draw the lines between the dots that were randomly selected
        var dot1 = document.getElementById(generatedPassword[i]);
        var dot2 = document.getElementById(generatedPassword[i+1]);
        document.getElementById("g-lines").appendChild(DrawSVGElement("line", { x1: dot1.attributes.cx.value, y1: dot1.attributes.cy.value, x2: dot2.attributes.cx.value, y2: dot2.attributes.cy.value, "marker-end": "url(#triangle)"}));
    }
    passwords[currentIndex][1] = generatedPassword; // update the current service's password with this new generated password
}

// Move on to the next service to either test or create on
function Next() {
    currentIndex ++;
    $("#nextbtn").attr("disabled", true); // disable the next button
    if (currentIndex >= 3) { // if it is authenticating
        ResetInput(); // reset the user's input on the grid
        // update html UI with jquery
        $("#numattempts").css("display", "block");
        $("#givenGrid").css("display", "none");
        $("#grid").css("float", "none");
        $("#hideradio").css("display", "none");
        $("#genbtn").attr("disabled", true);
        if (currentIndex >= (passwords.length * 2)) {
            $.ajax({ // send the post request with the log data
                url: "/log",
                type: "POST",
                data: { data: csvData },
                success: function(data) {
                    alert("Thank you for participating, your data has been successfully sent!\nYou may now close this tab.");
                },
                error: function(jqXHR, textStatus, err) {
                    alert("ERROR - An error has occured sending the log data to the server!");
                }
            });
            return;
        } else if (currentIndex === (passwords.length * 2) - 1) $("#nextbtn").css("display", "none"); // if on the last service to authenticate on hide the next button as theres nothing else after this
        // select a random password to test next
        do { randomIndex = Math.floor(Math.random() * 3); } while (passwords[randomIndex][2]);
        passwords[randomIndex][2] = true;
        $("#numattempts").text(passwords[randomIndex][3] + " Attempts Left");
        UpdateTitle(randomIndex, "Authenticate");
    } else { // else still generating
        GeneratePattern();
        UpdateTitle(currentIndex, "Create");
    }
}

GeneratePattern(); // generate a new pattern for email

function UpdateLineAndDot(newDot) {
    if (selected.includes(newDot.id)) return; // ignore if we've already been to this dot
    selected.push(newDot.id); // add to selected list
    prevSelectedDot = newDot; // update prevDot to newDot
    currentDrawLine = document.getElementById("dots-lines").appendChild(DrawSVGElement("line", {x1: prevSelectedDot.attributes.cx.value, y1: prevSelectedDot.attributes.cy.value, x2: prevSelectedDot.attributes.cx.value, y2: prevSelectedDot.attributes.cy.value})); // update current draw line's start position to newDot position
    document.getElementById("dots-activated").appendChild(DrawSVGElement("circle", {cx: prevSelectedDot.attributes.cx.value, cy: prevSelectedDot.attributes.cy.value, r: 5})); // draw activated dot on top of newDot position
}

// mouse down event handler
$("#dots").mousedown(function(event) {
    if (randomIndex !== -1 && passwords[randomIndex][3] === 0) return;
    ResetInput();
    UpdateLineAndDot(document.getElementById(event.target.id));
});

// mouse pointer enters a dot element
$("#dots").mouseenter(function(event) {
    if (!acceptInput) return; // ignore if we aren't accepting input at this time
    if (typeof currentDrawLine !== "undefined" && !selected.includes(event.target.id)) { // if user has mouse down and the dot isn't already selected then update grid
        currentDrawLine.setAttribute("x2", event.target.attributes.cx.value);
        currentDrawLine.setAttribute("y2", event.target.attributes.cy.value);
        currentDrawLine.setAttribute("marker-end", "url(#triangle)");
        UpdateLineAndDot(document.getElementById(event.target.id));
    }
});

// user released the left mouse button so verify their input
$("body").mouseup(function(event) { VerifyPassword(); });

// Verify if the user got the password correct
function VerifyPassword() {
    if (!acceptInput || ((randomIndex !== -1) && passwords[randomIndex][3] <= 0) || selected.length === 0) return;
    acceptInput = false;
    if (typeof currentDrawLine !== "undefined") { // disable current draw line and hide it
        currentDrawLine.setAttribute("x2", prevSelectedDot.attributes.cx.value);
        currentDrawLine.setAttribute("y2", prevSelectedDot.attributes.cy.value);
        currentDrawLine = undefined;
    }
    let identical = false;
    for (let i = 0; i < selected.length; i++) { // compare user's input with the correct password
        identical = ((randomIndex === -1) ? (selected[i] === generatedPassword[i] && selected.length === generatedPassword.length) : (selected[i] === passwords[randomIndex][1][i] && selected.length === passwords[randomIndex][1].length));
    }
    $("#inputPattern").addClass(" " + ((identical) ? "success" : "error")); // if it's correct show success css else show error css class
    log(((identical) ? "Success" : "Failure")); // log if they got it right or wrong
    if (randomIndex !== -1) { // if we're authenticating (not creating the password)
        if (identical) Next(); // go to the next authentication test (Could have added delay here but was messing with other things and not worth the time to figure it out)
        else {
            passwords[randomIndex][3]--; // decrease the number of attempts allowed by 1 since the user got it wrong
            $("#numattempts").text(passwords[randomIndex][3] + " Attempt" + ((passwords[randomIndex][3] === 1) ? "" : "s") + " Left"); // update text
            if (passwords[randomIndex][3] === 0) Next(); // if no more attempts left jump to next service
        }
    } else if (identical) $("#nextbtn").removeAttr("disabled"); // otherwise if we are creating and they got it right then enable the next button
    setTimeout(function() { ResetInput(); }, 3000); // wait 3 seconds before wiping the user's input
}

// reset the user's input on the grid
function ResetInput() {
    if (acceptInput) return;
    prevSelectedDot = undefined;
    document.getElementById("dots-activated").innerHTML = "";
    document.getElementById("dots-lines").innerHTML = "";
    selected = [];
    acceptInput = true;
    $("#inputPattern").removeClass(" success");
    $("#inputPattern").removeClass(" error");
}

// update the current draw line end x and end y position as user moves mouse within grid
$("#grid").mousemove(function(event) {
    if (selected.length === generatedPassword.length) VerifyPassword(); // verify the password if they reach the 5 limit length
    if (typeof prevSelectedDot !== "undefined" && typeof currentDrawLine !== "undefined") {
        point.x = event.clientX;
        point.y = event.clientY;
        var position = point.matrixTransform(svg.getScreenCTM().inverse());

        currentDrawLine.setAttribute("x2", position.x);
        currentDrawLine.setAttribute("y2", position.y);
    }
});

// radio button to hide unhide given password grid
$("#borderPass").click(function() { $("#givenPattern").css("display", (($("#givenPattern").css("display") == "block") ? "none" : "block")); });
