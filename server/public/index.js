var svg = document.getElementById("inputPattern");
var point = svg.createSVGPoint();
var prevSelectedDot, currentDrawLine;
var selected = [];
var passwords = [["Email", "", false, 3], ["Banking", "", false, 3], ["Shopping", "", false, 3]];
var currentIndex = 0, randomIndex = -1;
var generatedPassword = [];
var acceptInput = true;
var csvData = [];

var user = 'User_' + Math.floor(Math.random() * 10000000);
document.getElementById('staticUser').value = user;

function UpdateTitle(index, action) {
    document.getElementById("title").innerHTML = "<h1>" + passwords[index][0] + " (" + action + ")</h1>";
}

UpdateTitle(currentIndex, "Create");

function DrawSVGElement(elem, attributes) {
    var d = document.createElementNS('http://www.w3.org/2000/svg', elem);
    for (var k in attributes)
        d.setAttribute(k, attributes[k]);
    return d;
}

for (var x = 0; x < 5; x++) {
    for (var y = 0; y < 4; y++) {
        document.getElementById("dots").appendChild(DrawSVGElement("circle", {id: "dot" + x + "" + y, cx: (x + 1) * 25, cy: (y + 1) * 30, r: 2}));
        document.getElementById("g-dots").appendChild(DrawSVGElement("circle", {id: "g-dot" + x + "" + y, cx: (x + 1) * 25, cy: (y + 1) * 30, r: 2}));
    }
}

function log(action) {
    var date = new Date();
    var dateString = date.getFullYear() + "-" + ((date.getMonth() < 9) ? "0" : "") + (date.getMonth() + 1) + "-" + ((date.getDate() < 10) ? "0" : "") + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + ((date.getSeconds() < 10) ? "0" : "") + date.getSeconds();
    csvData.push([dateString, user, (currentIndex >= 3) ? "Authentication" : "Create", passwords[((currentIndex >= 3) ? randomIndex : currentIndex)][0], action]);
}

function GeneratePattern() {
    log("Generate");
    $("#nextbtn").attr("disabled", true);
    ResetInput();
    generatedPassword = [];
    document.getElementById("g-active").innerHTML = "";
    document.getElementById("g-lines").innerHTML = "";
    for (let i = 0; i < 5; i++) {
        var selectedDot;
        do { selectedDot = "dot" + Math.floor(Math.random() * 5) + "" + Math.floor(Math.random() * 4); } while(generatedPassword.includes(selectedDot)); // generate unique id
        generatedPassword.push(selectedDot);
        var dotInHTML = document.getElementById(("g-" + selectedDot));
        document.getElementById("g-active").appendChild(DrawSVGElement("circle", { cx: dotInHTML.attributes.cx.value, cy: dotInHTML.attributes.cy.value, r: 5}));
    }
    for (let i = 0; i < generatedPassword.length-1; i++) {
        var dot1 = document.getElementById(generatedPassword[i]);
        var dot2 = document.getElementById(generatedPassword[i+1]);
        document.getElementById("g-lines").appendChild(DrawSVGElement("line", { x1: dot1.attributes.cx.value, y1: dot1.attributes.cy.value, x2: dot2.attributes.cx.value, y2: dot2.attributes.cy.value, "marker-end": "url(#triangle)"}));
    }
    passwords[currentIndex][1] = generatedPassword;
}

function Next() {
    currentIndex ++;
    $("#nextbtn").attr("disabled", true);
    if (currentIndex >= 3) {
        ResetInput();
        $("#numattempts").css("display", "block");
        $("#givenGrid").css("display", "none");
        $("#grid").css("float", "none");
        $("#hideradio").css("display", "none");
        $("#genbtn").attr("disabled", true);
        if (currentIndex >= (passwords.length * 2)) {
            $.ajax({
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
        } else if (currentIndex === (passwords.length * 2) - 1) $("#nextbtn").css("display", "none");

        do { randomIndex = Math.floor(Math.random() * 3); } while (passwords[randomIndex][2]);
        passwords[randomIndex][2] = true;
        $("#numattempts").text(passwords[randomIndex][3] + " Attempts Left");
        UpdateTitle(randomIndex, "Authenticate");
    } else {
        GeneratePattern();
        UpdateTitle(currentIndex, "Create");
    }
}

GeneratePattern();

function UpdateLineAndDot(newDot) {
    if (selected.includes(newDot.id)) return;
    selected.push(newDot.id);
    prevSelectedDot = newDot;
    currentDrawLine = document.getElementById("dots-lines").appendChild(DrawSVGElement("line", {x1: prevSelectedDot.attributes.cx.value, y1: prevSelectedDot.attributes.cy.value, x2: prevSelectedDot.attributes.cx.value, y2: prevSelectedDot.attributes.cy.value}));
    document.getElementById("dots-activated").appendChild(DrawSVGElement("circle", {cx: prevSelectedDot.attributes.cx.value, cy: prevSelectedDot.attributes.cy.value, r: 5}));
}

$("#dots").mousedown(function(event) {
    if (randomIndex !== -1 && passwords[randomIndex][3] === 0) return;
    ResetInput();
    UpdateLineAndDot(document.getElementById(event.target.id));
});
$("#dots").mouseenter(function(event) {
    if (!acceptInput) return;
    if (typeof currentDrawLine !== "undefined" && !selected.includes(event.target.id)) {
        currentDrawLine.setAttribute("x2", event.target.attributes.cx.value);
        currentDrawLine.setAttribute("y2", event.target.attributes.cy.value);
        currentDrawLine.setAttribute("marker-end", "url(#triangle)");
        UpdateLineAndDot(document.getElementById(event.target.id));
    }
});

$("body").mouseup(function(event) { VerifyPassword(); });

function VerifyPassword() {
    if (!acceptInput || ((randomIndex !== -1) && passwords[randomIndex][3] <= 0) || selected.length === 0) return;
    acceptInput = false;
    if (typeof currentDrawLine !== "undefined") {
        currentDrawLine.setAttribute("x2", prevSelectedDot.attributes.cx.value);
        currentDrawLine.setAttribute("y2", prevSelectedDot.attributes.cy.value);
        currentDrawLine = undefined;
    }
    let identical = false;
    for (let i = 0; i < selected.length; i++) {
        identical = ((randomIndex === -1) ? (selected[i] === generatedPassword[i] && selected.length === generatedPassword.length) : (selected[i] === passwords[randomIndex][1][i] && selected.length === passwords[randomIndex][1].length));
    }
    $("#inputPattern").addClass(" " + ((identical) ? "success" : "error"));
    log(((identical) ? "Success" : "Failure"));
    if (randomIndex !== -1) {
        if (identical) Next();
        else {
            passwords[randomIndex][3]--;
            $("#numattempts").text(passwords[randomIndex][3] + " Attempt" + ((passwords[randomIndex][3] === 1) ? "" : "s") + " Left");
            if (passwords[randomIndex][3] === 0) Next();
        }
    } else if (identical) $("#nextbtn").removeAttr("disabled");
    setTimeout(function() { ResetInput(); }, 3000);
}

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

$("#grid").mousemove(function(event) {
    if (selected.length === generatedPassword.length) VerifyPassword();
    if (typeof prevSelectedDot !== "undefined" && typeof currentDrawLine !== "undefined") {
        point.x = event.clientX;
        point.y = event.clientY;
        var position = point.matrixTransform(svg.getScreenCTM().inverse());

        currentDrawLine.setAttribute("x2", position.x);
        currentDrawLine.setAttribute("y2", position.y);
    }
});

$("#borderPass").click(function() { $("#givenPattern").css("display", (($("#givenPattern").css("display") == "block") ? "none" : "block")); });
