/*
Submarine Game
Damian Poclitar
*/


//Intialising variables
var currLocation;
var valid = true;
var userPlaced = false;
var stage = "Setup";
var userOutOfBounds = false;
var killerCountSetup = 0;
var killerCountPlay;
var totalFuel = 0;

var round = 0;
var fuel = 10;
var userScore = 0;
var computerScore = 0;

var userMove;
var playerTurn;
var player;

var killOutOfBounds = false;
var userKilled = false;

//Setting up buttons and labels for the set up stage
document.getElementById("outcome").innerHTML = "";
document.getElementById("startEnd").innerHTML = "Start";
document.getElementById("submit").disabled = true;
document.getElementById("userInput").disabled = true;


//StartEnd button function, during set up it calls the gridScanSetup() function to go to the play stage
//and during play stage it disables the buttons, changes stage to end, calls the scoreboard() for update and endPhase() function
document.getElementById("startEnd").onclick = function() {

    if (stage == "Setup"){

        gridScanSetup()
    }
    else if(stage == "Play"){

        stage = "End"
        document.getElementById("stage").innerHTML = "Stage:" + stage;
        document.getElementById("startEnd").disabled = true;
        document.getElementById("submit").disabled = true;
        document.getElementById("userInput").disabled = true;
        scoreboard();
        endPhase();
    }
}

//Submit button to allow the user to move the battle ship, validation checking if anything is present, if there is, call rounds() function
document.getElementById("submit").onclick = function() {
    if (document.getElementById("userInput").value != ""){
        document.getElementById("outcome").innerHTML = "";
        rounds();
    }
    else{
        document.getElementById("outcome").innerHTML = "Please insert an input in the text field above.";
    }
}

//gridScanSetup() function checks each box in the board and makes notes of how many killers and how much fuel is available
//also validation in check to make sure that only the allowed characters are inputted
function gridScanSetup(){

    var currLocationValue;
    userCount = 0;
    valid = true;
    userPlaced = false;
    var badInputLoc;

    //Nested for loop checking each box if it contains a value, 
    //if it does it calls gridContentValid() function with the currentLocation value to see if it is a valid value
    //if its not then break the loop and present an error to the user
    //also checks if user is already placed so that it doesn't allow 2 users
    for (i=0; i<10; i++){
        if (!valid){
            break;
        }
        for (f=0; f<10; f++){
            if (userPlaced && userCount != 1){
                valid = false;
                break;
            }
            if (document.getElementById(i+"-"+f).value != ""){
                currLocationValue = document.getElementById(i+"-"+f).value;
                gridContentValid(currLocationValue);
                if (!valid){
                    badInputLoc = i+"-"+f;
                    break;
                }
            }
        }
    }


    //if statements, provides warnings if the board contains invalid characters and also points to which position
    if(valid && !userPlaced){
        document.getElementById("outcome").innerHTML = "There must be at least one U on the board";
    }
    else if(!valid && userPlaced){
        document.getElementById("outcome").innerHTML = "Board contains invalid character at " + badInputLoc;
    }
    else if(!valid && !userPlaced){
        document.getElementById("outcome").innerHTML = "Board contains invalid character at " + badInputLoc;
    }

    //if the board is valid and user is placed, it calls the endPhaseConditions() function to check if any of the end phase conditions are triggered
    //such as no fuel cells or killer cells, if there aren't it disables the buttons, updates the scoreboard and stage variable and calls the endPhase() function;
    //if there are killer cells and fuel cells then it changes the stage variable to play, enables the movement field and button, calls lockGrid() function and sets up the scoreboard.
    else{
        if(endPhaseConditions()){
            stage = "Play";
            document.getElementById("stage").innerHTML = "Stage:" + stage;
            document.getElementById("submit").disabled = false;
            document.getElementById("userInput").disabled = false;
            document.getElementById("startEnd").innerHTML = "End";
            lockGrid();
            scoreboard();
        }
        else{
            stage = "End"
            document.getElementById("stage").innerHTML = "Stage:" + stage;
            document.getElementById("startEnd").disabled = true;
            scoreboard();
            endPhase();
        }
    }
}

//gridContentValid function uses switch case to check if the sent value fits within the allowed ones
//if its not it goes to default case with valid = false so that it can display an error to the user
//each time fuel is detected it is added to the totalFuel variable, it is used to check how much fuel is on the board
//and allows the program to know if all the fuel has been picked up by combining the total scores
//it also checks how many killers have been placed and if the user has already been placed or not
function gridContentValid(currValue){

    currValue = currValue.toLowerCase();

    switch(currValue){
        case "5":
            totalFuel = totalFuel + 5;
            break;
        case "6":
            totalFuel = totalFuel + 6;
            break;
        case "7":
            totalFuel = totalFuel + 7;
            break;
        case "8":
            totalFuel = totalFuel + 8;
            break;
        case "9":
            totalFuel = totalFuel + 9;
            break;
        case "o":
            break;
        case "u":
            userPlaced = true;
            userCount++;
            break;
        case "k":
            killerCountSetup++;
            break;
        default:
            valid = false;
            break;

    }

    return;
}

//rounds function is called whenever the user submits a movement character in the field
function rounds(){


    document.getElementById("outcome").innerHTML = "";

    userMove = document.getElementById("userInput").value
    userMove = userMove.toLowerCase();

    //checks first if any of the endPhase conditions are triggered
    //if not, it continues with checking that the input is one of the w a d x movement buttons, displays an error if not
    //playTurn variable is used to indicate when the user moves or when the killer robots move, the inputted character is sent to the movement() function
    //movement function checks if the user moves out of bounds, if not then the round goes up and the fuel goes down and playerTurn is false followed by 
    //a loop based on how many killers are counted in the setup stage, calling the aiMove() function and updating killerCountPlay variable to indicate which killer is moving
    //lastly scoreboard() function is called once everyone moved.
    if (endPhaseConditions()){
        if (userMove == "w"|| userMove == "a" || userMove == "d" || userMove == "x"){

            playerTurn = true;
            if (fuel > 0){
                movement(userMove);
                    if (!userOutOfBounds){
                    round++;
                    fuel--;
                    playerTurn = false;
                    for (m=0; m<killerCountSetup; m++){

                        killerCountPlay = killerCountSetup - m;
                        aiMove();

                    }
                    scoreboard();
                }
            }
            else{
                document.getElementById("outcome").innerHTML = "Out of fuel";
            }

        }
        else{
            document.getElementById("outcome").innerHTML = "Invalid input, use WADX to move.";
        }
    }
    //if endPhaseCondition is triggered, the program instead changes the stage to end and disables the button, calls the scoreboard and moves to the endPhase() function
    else{
        stage = "End"
        document.getElementById("stage").innerHTML = "Stage:" + stage;
        document.getElementById("startEnd").disabled = true;
        document.getElementById("submit").disabled = true;
        document.getElementById("userInput").disabled = true;
        scoreboard();
        endPhase();
    }

}

//aiMove function that chooses a random move available for the killer robots and then sends the choice to movement() function
function aiMove(){

    let aiMoves = ["a", "w", "d", "x", "aw", "wd", "ax", "xd"];
    let random = Math.random();
    let totalMoves = aiMoves.length;
    let randomIndex = Math.floor(random * totalMoves);
    let randomMove = aiMoves[randomIndex];

    movement(randomMove);

}

//scoreboard() function is called to update the scoreboard with the latest variables such as round, fuel, and scores.
function scoreboard(){
    document.getElementById("round").innerHTML = "Round: " + round;
    document.getElementById("fuel").innerHTML = "Fuel: " + fuel;
    document.getElementById("userScore").innerHTML = "User Score: " + userScore;
    document.getElementById("computerScore").innerHTML = "Computer Score: " + computerScore;
}

//movement function that is used by both the user and the killer submarines, it takes the variable inputted "a w d x" but also "aw wd ax xd" for the killers
function movement(userMove){

    //intialising variables
    var returnArray;
    var currLocation;
    var currLocationY;
    var currLocationX;
    var w;
    var a;
    var d;
    var x;
    var aw;
    var wd;
    var ax;
    var xd;

    userOutOfBounds = false;
    killOutOfBounds = false;
    
    //if statements based on the input received
    //the four available directions for the user (a w d x) also contain a section for the killers
    //firstly it calls the playerMove() function to return the coordinates of either the user or the killers
    //based on the direction, the coordinates are modified to fit the direction needed, and then it checks that
    //neither the user or the killer is going out of bounds, if they don't then it calls the checkDesiredPosition() function to check if there is anything in that desired cell
    //if the desired cell does not include "o" or another killer if the killer moves, then it deletes the current cell and rewrites the user or the killer in the desired cell
    //if the movement of the user would cause them to go onto a killer cell then it only deletes the user
    //if the user wants to move out of bounds or onto a "o" obstacle then it displays an error and removes a turn and adds a fuel so that nothing is changed
    //if the killer is about to move out of bounds or onto "o" or another killer then recall the aiMove() function to choose a new direction
    if (userMove == "w"){

        returnArray = playerMove();
        
        currLocationY = returnArray[0];
        currLocationX = returnArray[1];

        currLocation = currLocationY + "-" + currLocationX;

        currLocationY--;
        currLocationX;
        w = currLocationY + "-" + currLocationX;

        if (playerTurn){
            if (currLocationY > -1){

                checkDesiredPosition(w)
                if(!userOutOfBounds && !userKilled){
                    document.getElementById(currLocation).value = "";
                    document.getElementById(w).value = "u";
                }
                else if(userKilled){
                    document.getElementById(currLocation).value = "";
                }
            }
            else{
                document.getElementById("outcome").innerHTML = "Invalid move, you can't move out of bounds or onto obostacles.";
                userOutOfBounds = true;
                round--;
                fuel++;
            }
        }
        else{
            if (currLocationY > -1){

                checkDesiredPosition(w)
                if(!killOutOfBounds){
                    document.getElementById(currLocation).value = "";
                    document.getElementById(w).value = "k";
                }
                else{
                    aiMove();
                }
            }
            else{
                aiMove();
            }
        }

    }
    if (userMove == "a"){

        returnArray = playerMove();
        
        currLocationY = returnArray[0];
        currLocationX = returnArray[1];

        currLocation = currLocationY + "-" + currLocationX;

        currLocationY;
        currLocationX--;
        a = currLocationY + "-" + currLocationX;

        if (playerTurn){
            if (currLocationX > -1){

                checkDesiredPosition(a)
                if(!userOutOfBounds && !userKilled){
                    document.getElementById(currLocation).value = "";
                    document.getElementById(a).value = "u";
                }
                else if(userKilled){
                    document.getElementById(currLocation).value = "";
                }
            }
            else{
                document.getElementById("outcome").innerHTML = "Invalid move, you can't move out of bounds or onto obostacles."
                userOutOfBounds = true;
                round--;
                fuel++;;
            }
        }
        else{
            if (currLocationX > -1){

                checkDesiredPosition(a)
                if(!killOutOfBounds){
                    document.getElementById(currLocation).value = "";
                    document.getElementById(a).value = "k";
                }
                else{
                    aiMove();
                }
            }
            else{
                aiMove();
            }
        }

    }
    if (userMove == "d"){

        returnArray = playerMove();
        
        currLocationY = returnArray[0];
        currLocationX = returnArray[1];

        currLocation = currLocationY + "-" + currLocationX;
        
        currLocationY;
        currLocationX++;
        d = currLocationY + "-" + currLocationX;

        if (playerTurn){
            if(currLocationX < 10){

                checkDesiredPosition(d)
                if(!userOutOfBounds && !userKilled){
                    document.getElementById(currLocation).value = "";
                    document.getElementById(d).value = "u";
                }
                else if(userKilled){
                    document.getElementById(currLocation).value = "";
                }
            }
            else{
                document.getElementById("outcome").innerHTML = "Invalid move, you can't move out of bounds or onto obstacles."
                userOutOfBounds = true;
                round--;
                fuel++;;
            }
        }
        else{
            if (currLocationX < 10){

                checkDesiredPosition(d)
                if(!killOutOfBounds){
                    document.getElementById(currLocation).value = "";
                    document.getElementById(d).value = "k";
                }
                else{
                    aiMove();
                }
            }
            else{
                aiMove();
            }
        }

    }
    if (userMove == "x"){

        returnArray = playerMove();
        
        currLocationY = returnArray[0];
        currLocationX = returnArray[1];

        currLocation = currLocationY + "-" + currLocationX;

        currLocationY++;
        currLocationX;
        x = currLocationY + "-" + currLocationX;
        if (playerTurn){
            if(currLocationY < 10){

                checkDesiredPosition(x)
                if(!userOutOfBounds && !userKilled){
                    document.getElementById(currLocation).value = "";
                    document.getElementById(x).value = "u";
                }
                else if(userKilled){
                    document.getElementById(currLocation).value = "";
                }
            }
            else{
                document.getElementById("outcome").innerHTML = "Invalid move, you can't move out of bounds or onto obostacles.";
                userOutOfBounds = true;
                round--;
                fuel++;;
            }
        }
        else{
            if (currLocationY < 10){

                checkDesiredPosition(x)
                if(!killOutOfBounds){
                    document.getElementById(currLocation).value = "";
                    document.getElementById(x).value = "k";
                }
                else{
                    aiMove();
                }
            }
            else{
                aiMove();
            }
        }
    }

    //following 4 if statements are the same as before but only for the killers since only they can move diagonally
    if (userMove == "aw"){

        returnArray = playerMove();
        
        currLocationY = returnArray[0];
        currLocationX = returnArray[1];

        currLocation = currLocationY + "-" + currLocationX;

        currLocationY--;
        currLocationX--;
        aw = currLocationY + "-" + currLocationX;

        if (currLocationY > -1 && currLocationX > -1){

            checkDesiredPosition(aw)
            if(!killOutOfBounds){
                document.getElementById(currLocation).value = "";
                document.getElementById(aw).value = "k";
            }
            else{
                aiMove();
            }
        }
        else{
            aiMove();
        }
    }
    if (userMove == "wd"){

        returnArray = playerMove();
        
        currLocationY = returnArray[0];
        currLocationX = returnArray[1];

        currLocation = currLocationY + "-" + currLocationX;

        currLocationY--;
        currLocationX++;
        wd = currLocationY + "-" + currLocationX;

        if (currLocationY > -1 && currLocationX < 10){

            checkDesiredPosition(wd)
            if(!killOutOfBounds){
                document.getElementById(currLocation).value = "";
                document.getElementById(wd).value = "k";
            }
            else{
                aiMove();
            }
        }
        else{
            aiMove();
        }

    }
    if (userMove == "ax"){
        returnArray = playerMove();
        
        currLocationY = returnArray[0];
        currLocationX = returnArray[1];

        currLocation = currLocationY + "-" + currLocationX;

        currLocationY++;
        currLocationX--;
        ax = currLocationY + "-" + currLocationX;

        if (currLocationY < 10 && currLocationX > -1){

            checkDesiredPosition(ax)
            if(!killOutOfBounds){
                document.getElementById(currLocation).value = "";
                document.getElementById(ax).value = "k";
            }
            else{
                aiMove();
            }
        }
        else{
            aiMove();
        }

    }
    if (userMove == "xd"){
        returnArray = playerMove();
        
        currLocationY = returnArray[0];
        currLocationX = returnArray[1];

        currLocation = currLocationY + "-" + currLocationX;

        currLocationY++;
        currLocationX++;
        xd = currLocationY + "-" + currLocationX;

        if (currLocationY < 10 && currLocationX < 10){

            checkDesiredPosition(xd)
            if(!killOutOfBounds){
                document.getElementById(currLocation).value = "";
                document.getElementById(xd).value = "k";
            }
            else{
                aiMove();
            }
        }
        else{
            aiMove();
        }

    }
}

//playerMove function is called to get the current location of the user or the killer
function playerMove(){
    
    //temporary variables
    var currLocationValue;
    var currLocationY;
    var currLocationX;

    //checks if its playerTurn or not
    //to know if searching for user or killer
    //if killer the KillerCountTemp becomes equal to the # of killer that we want to move
    if (playerTurn){
        player = "u"
    }
    else{
        player = "k"
        var killerCountTemp = killerCountPlay;
    }
    
    //nested for loop to scan the board
    //if the killer is found but it is not the desired one then it continues
    //if the killer is found and its the desired # of killer then it returns the X and Y position as an array
    //if the user is found return the X and Y position as an array
    for (i=0; i<10; i++){
        for (f=0; f<10; f++){

            currLocationValue = document.getElementById(i+"-"+f).value;
            currLocationValue = currLocationValue.toLowerCase();

            if (!playerTurn && killerCountTemp > 1 && currLocationValue == player){
                killerCountTemp--;
                continue;
            }
            if (playerTurn && currLocationValue == player){

                currLocationY = i;
                currLocationX = f;
                return [currLocationY, currLocationX];

            }
            else if(!playerTurn && killerCountTemp == 1 && currLocationValue == player){
                
                currLocationY = i;
                currLocationX = f;
                return [currLocationY, currLocationX];

            }
        }
    }
}

//checkDesiredPosition() function that takes the coordinates of the desired cell that the user or killer cell wants to move into
//uses switch cases to check if the desired cell contains a value
//if it contains 5-9 fuel, based on if its the user or the killer moving then it is added to the fuel and the score or for the killer only the score
//if its a "o" cell then the user is not allowed to move and is disabled with an error, if the killer tries to move there then it is denied and killerOutOfBounds variable is true 
//so that a new move can be chosen
//if the killer moves onto the user "u" then the userKilled variable becomes true to be checked in the endPhaseConditions() function
//if the user moves onto a killer "k" again, the userKilled variable comes true, if its another killer moving into a killer then the killerOutOfBounds variable is true to choose another move
function checkDesiredPosition(move){

    var checkPosition = document.getElementById(move).value
    checkPosition = checkPosition.toLowerCase();

    switch(checkPosition){
        case "5":
            if (playerTurn){
                fuel = fuel + 5;
                userScore = userScore + 5;
            }
            else{
                computerScore = computerScore + 5;
            }
            break;
        case "6":
            if (playerTurn){
                fuel = fuel + 6;
                userScore = userScore + 6;
            }
            else{
                computerScore = computerScore + 6;
            }
            break;
        case "7":
            if (playerTurn){
                fuel = fuel + 7;
                userScore = userScore + 7;
            }
            else{
                computerScore = computerScore + 7;
            }
            break;
        case "8":
            if (playerTurn){
                fuel = fuel + 8;
                userScore = userScore + 8;
            }
            else{
                computerScore = computerScore + 8;
            }
            break;
        case "9":
            if (playerTurn){
                fuel = fuel + 9;
                userScore = userScore + 9;
            }
            else{
                computerScore = computerScore + 9;
            }
            break;
        case "o":
            if (playerTurn){
                document.getElementById("outcome").innerHTML = "Invalid move, you can't move out of bounds or onto obostacles.";
                userOutOfBounds = true;
                round--;
                fuel++;
            }
            else{
                killOutOfBounds = true;
            }
            break;
        case "u":
            userKilled = true;
            break;
        case "k":
            if (playerTurn){
                userKilled = true;
            }
            else{
                killOutOfBounds = true;
            }
            break;
    }
}

//endPhaseConditions() function returns false if any of the conditions to end the phase are found
//such as no killers, user is killed, all the fuel is picked up or 0 fuel, else return true.
function endPhaseConditions(){

    if (killerCountSetup == 0 || userKilled || totalFuel == userScore + computerScore || fuel == 0){
        return false;
    }
    else{
        return true;
    }
}

//endPhase() function is called to check if statements and based on the conditions display an output of either win, lose or draw with the scores shown.
//user wins if there are no killer submarines or if the user has a higher score than the killer submarines when all the fuel is called
//killer submarines win if the user was killed or if they have a higher score than the user
//else draw
function endPhase(){
    
    if (killerCountSetup == 0 || (userScore > computerScore && !userKilled)){

        document.getElementById("outcome").innerHTML = "User wins with score: " + userScore;
    }
    else if(userKilled || computerScore > userScore){

        document.getElementById("outcome").innerHTML = "Computer wins with score: " + computerScore;
    }
    else{

        document.getElementById("outcome").innerHTML = "Draw between user and computer.";
    }
}


//lockGrid() function is called to lock the grid after set up stage so that the user can not change it midgame
function lockGrid(){


    for (i=0; i<10; i++){
        for (f=0; f<10; f++){
            document.getElementById(i+"-"+f).disabled = true;
        }
    }

}