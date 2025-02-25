Village Savior - Rishi Karri
# Contents
    1. Overview
    2. What I Used
    3. Challenges and Solutions
    4. MVP
    5. Stretch Goals
    6. Author
    7. Demo of Gameplay
    8. Code Examples

## Overview
    
    This game is a basic survivor game where the character has access to a shop. 
    The goal of the game is to fend off monsters and bandits for as long as possible.
    Score equated to number of seconds with health > 0. 

## How to run it locally 
    
    1. Clone repo 
    2. open index.html in a browser 

## What I Used
    HTML & CSS, HTML Canvas, JavaScript (code is intentionally written without frameworks)

    AWS S3, Route53 for deployment and making the game run off more than just my local machine.

## Challenges and Solutions
    
    Challenge 1: Create a goblin that moves around the map randomly.

    Solution: I solved this problem by initializing the goblin with a random destination. 
    Once the goblin reached its destination, another random destination is generated. 
    This caused the goblin to move around randomly. 

    Challenge 2: Prevent the user from buying things he / she can't afford. 

    Solution: The solution to this problem was actually easier than I thought. 
    Each time the user opened up the shop, I ran code to see if the user had sufficient funds to purchase any of the items. 
    If so, I allowed the button to remain on the page. 
    If not, I disabled it, thus preventing the user from purchasing an item that was out of his / her budget. 

    Challenge 3: Create a ninja that is an ally and throws ninja stars which can injure enemies. 

    Solution: I solved this problem by making the ninja movement similar to the goblin. 
    The ninja always has a random destination. When the ninja gets to its destination, it throws a ninja star based on where it is on the screen. If it is on the left side of the screen, it throws the ninja star right. 
    If it is on the right side of the screen, it throws its ninja star left. 
    This prevents the ninja from throwing useless stars and provides the user with a helpful ally. 

    

## MVP
    Allow the user to:
        1. Fight goblins succesfully using arrows
        2. Lose the game if his/her health falls to 0
        3. Buy a health potion at a shop

## My Stretch Goals
    Allow the user to:
        1. Fight bandits
        2. Fight Golems
        3. Buy a speed potion
        4. Buy flaming arrows
        5. Hire a ninja
        6. See his/her score which tracks how long the user is alive
        7. Pause, resume and start a new game


## Author
    Rishi Karri
    

## Demo of gameplay: 
    http://village-savior.s3-website-us-east-1.amazonaws.com/
    (canoncial URL coming soon)


## Code Examples
    
    Within the draw function: 

        // drawing ninjas on the screen in addition to each one of their personal ninja star locations
        for (var i = 0; i < ninjaArray.length; i++){
            context.drawImage(ninjaArray[i].image, ninjaArray[i].x, ninjaArray[i].y);
            context.drawImage(ninjaArray[i].ninjaStarImage, ninjaArray[i].ninjaStarLocation.x, ninjaArray[i].ninjaStarLocation.y);

        }


    Game over function: 
        //end game if player has 0 or less health
        function checkGameStatus(health){
            if(health <= 0){
                //you lost
                gameOn = false;
                document.getElementById("textDisplay").innerHTML = "GAME OVER";     
                //make certain buttons inaccessible after user loses            
                disableButton("pause-button");
                disableButton("resume-button");
                disableButton("open-shop-button");
            }
        }


    Within the update function: 

        // a for loop that goes through all necessary updates for all goblins
        for (var i = 0; i < goblinArray.length; i++) {
            if(goblinArray[i].health >= 0){
                //if the goblin has more than 0 health move it and check to see
                //if it catches our hero, gets hit by a star or gets hit by an arrow         
                goblinArray[i].move();
                goblinArray[i].catchHero();
                goblinArray[i].getHitByNinjaStar();
                goblinArray[i].getHitByArrow();         
            }
        }



