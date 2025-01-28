// creating a canvas element
var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");

// set the canvas height and width 
canvas.width = 675;
canvas.height = 480;

document.getElementById("middle-section").appendChild(canvas);
var backgroundImage = new Image();
backgroundImage.src = "Images/background2.jpeg";

//
// ----------------------------------------------------------
// ----------------------GLOBALS-----------------------------
// ----------------------------------------------------------

// ----------------------------------------------------------
// ----------------Administrative Section, Instructions------
// ----------------------------------------------------------

function generateUniqueId() {
	// Generate a random string using a combination of characters
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 16; i++) { 
	  result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
  }
  




var score = 0;

counterInterval = setInterval(updateCounter, 1000);

function updateCounter() {

	score++;

	document.getElementById("scoreKeeper").innerHTML = "Score: " + score;

}


var highScore = localStorage.getItem("highScore");
document.getElementById("highScoreKeeper").innerHTML = "High Score: " + highScore;
//get the highsore
function checkIfHighScore() {
	// convert highScore into a number because it is currently a string
	highScore = Number(highScore);
	if (score > highScore) {
		highScore = score;
		document.getElementById("highScoreKeeper").innerHTML = "High Score: " + highScore;
		localStorage.setItem("highScore", highScore);
	} else {
		document.getElementById("highScoreKeeper").innerHTML = "High Score: " + highScore;
	}
}


var gameOn = true;

monsterIntervalManager(false);

function monsterIntervalManager(clearMe) {
	// clear Intervals if clearMe is true, otherwise don't

	if (clearMe) {
		clearInterval(goblinInterval);
		clearInterval(thugInterval);
		clearInterval(golemInterval);
	} else {
		//clear interval and then set it incase user presses resume multiple times
		clearInterval(goblinInterval);
		clearInterval(thugInterval);
		clearInterval(golemInterval);

		goblinInterval = setInterval(generateGoblin, 5000);
		thugInterval = setInterval(generateThug, 7000);
		golemInterval = setInterval(generateGolem, 35000);
	}
}

function startGame() {

	//set hero's health to 20  when the game starts
	// refresh teh page to start a new game
	location.reload();
}


function userPause() {
	if (32 in keysPressed) {
		pauseGame();
	}
}


function pauseGame() {
	gameOn = false;
	monsterIntervalManager(true);
	enableButton("resume-button");
}

// disable resume button from teh start
disableButton("resume-button");
function resumeGame() {
	gameOn = true;
	counterInterval = setInterval(updateCounter, 1000); //update the counter every second
	monsterIntervalManager(false);
	disableButton("resume-button");
	// var goblinInterval = setInterval(generateGoblinNumber, 5000);
	// var golemInterval = setInterval(generateGolemNumber, 35000);
	// var thugInterval = setInterval(generateThugNumber, 7000);
}

function openShop() {
	// pause ggame so it's not running in the background
	gameOn = false;
	monsterIntervalManager(false);
	enableButton("resume-button");

}



// CREATE EVENT LISTENERS

var keysPressed = []; //array that holds whats in the array
const keyQueue = []
var displayGold;//need to define out here for global scope 

addEventListener("keyup", function (event) {
	delete keysPressed[event.keyCode];
})
//anonymous functions to pass moveRobinhood commands 
addEventListener("keydown", function (event) {
	if (event.keyCode === 65 || event.keyCode === 68)

		keyQueue.push(event.keyCode)
	console.log('keyQueue', keyQueue)

	keysPressed[event.keyCode] = true; //this position of the array has a position of true
})

//CREATE CONSTRUCTORS
//

//create a Hero constructor - takes in a name and an image to create a new one, for now we will only create one
var shooting = false;
var arrowDamage = 1;
function Hero(name, image, speed) {
	this.name = name;
	this.health = 20;
	this.gold = 0;
	this.image = new Image();
	this.image.src = image;
	this.speed = speed;
	this.x = 200;
	this.y = 200;
	this.faceLeft = false;
	this.arrowImage = new Image();
	this.arrowImage.src = "Images/arrow-right.png";
	// this function will have the arrow follow the hero if he is not shooting
	this.arrowFollow = function () {
		if (!shooting) {
			if (this.faceLeft) {
				this.arrowLocation.x = this.x - 4;
				this.arrowLocation.y = this.y + 18;

			}

			if (!this.faceLeft) {
				this.arrowLocation.x = this.x + 22;
				this.arrowLocation.y = this.y + 18;

			}
		}
	}

	this.arrowLocation = {
		x: 222,
		y: 218,
		destinationX: 222,
		destinationY: 218
	}
	// create a function native to the main character that allows him to move
	this.move = function (keysPressed) {

		const movementBounds = {
			x1: 80,
			x2: 520,
			y1: 30,
			y2: 390
		}

		// don't let arrow go off map
		if (this.arrowLocation.x > movementBounds.x2) {
			console.log("ARROW OFF X MAP")
			shooting = false;
		}

		if (this.arrowLocation.x < movementBounds.x1) {
			console.log("ARROW OFF X2 MAP")
			shooting = false;
		}


		if (37 in keysPressed) {
			if (this.x >= movementBounds.x1) {
				this.x -= 7 * this.speed;
				// Make archer look left if he is moving left - do the same with arrow
				this.image.src = "possible-enemies-allies/archer3-left.png";
				//if the user upgraded arrows, show fire arrows, otherwise show regular arrows
				if (arrowDamage == 2) {
					this.arrowImage.src = "Images/flaming-arrow2 left.png"
				} else {
					this.arrowImage.src = "Images/arrow-left.png";
				}

				if (!shooting) {
					this.arrowLocation.x = this.x - 4;
					this.arrowLocation.y = this.y + 18;
				}
				this.faceLeft = true;

			}
		}
		if (38 in keysPressed) {
			if (this.y >= movementBounds.y1) {
				this.y -= 7 * this.speed;
			}
		}
		if (39 in keysPressed) {
			if (this.x <= movementBounds.x2) {
				this.x += 7 * this.speed;
				this.image.src = "possible-enemies-allies/archer3.png";
				if (arrowDamage === 2) {
					this.arrowImage.src = "Images/flaming-arrow2.png";
				} else {
					this.arrowImage.src = "Images/arrow-right.png";
				}

				// this.arrowLocation.x = this.x + 22;
				// this.arrowLocation.y = this.y + 18;
				this.faceLeft = false;

			}
		}
		if (40 in keysPressed) {
			if (this.y <= movementBounds.y2) {
				this.y += 7 * this.speed;
			}
		}
	}

	this.shoot = function (keyQueue) {
		console.log('keyQueue', keyQueue)
		// if (65 in keyQueue && 68 in keyQueue) {
		// 	// if the user is pressing both keys return the arrow to robinhood - they can't shoot left and right at the same time!!
		// 	this.stopShooting();
		// }

		if (keyQueue.length > 0) {

			const dKey = 68
			const aKey = 65

			const keyPressed = keyQueue.pop()

			console.log(keyPressed, 'keypressed')
			if (keyPressed == dKey) {
				console.log('shooting function')
				//shooting prevents arrow from moving with character
				shooting = true;
				// if the spacebar is hit, shoot the arrow 50 pixels right, user can hold it to make it go farther
				let addDistanceCounter = 1;

				const arrowId = generateUniqueId();
				const newArrow = new Arrow(arrowId, robinHood.x, robinHood.y, robinHood.x + 450)

				arrows[arrowId] = newArrow

				console.log('arrows', arrows)

				this.arrowLocation.destinationX = this.arrowLocation.x + 450;

				console.log('this.arrowLocation', this.arrowLocation)


				// change image source and make sure the character is facing right
				this.image.src = "possible-enemies-allies/archer3.png";
				this.faceLeft = false;
				if (arrowDamage === 2) {
					this.arrowImage.src = "Images/flaming-arrow2.png";
				} else {
					this.arrowImage.src = "Images/arrow-right.png";
				}

			}

			if (keyPressed == aKey) {
				shooting = true;
				this.arrowLocation.destinationX = this.arrowLocation.x - 400;


				// change the image source and make sure the character is shooting left
				this.image.src = "possible-enemies-allies/archer3-left.png";
				this.faceLeft = true;

				if (arrowDamage == 2) {
					this.arrowImage.src = "Images/flaming-arrow2 left.png"
				} else {
					this.arrowImage.src = "Images/arrow-left.png";
				}

			}

		}

		if (keyQueue.indexOf(65) !== -1) {
			shooting = true;
			this.arrowLocation.destinationX = this.arrowLocation.x - 200;


			// change the image source and make sure the character is shooting left
			this.image.src = "possible-enemies-allies/archer3-left.png";
			this.faceLeft = true;

			if (arrowDamage == 2) {
				this.arrowImage.src = "Images/flaming-arrow2 left.png"
			} else {
				this.arrowImage.src = "Images/arrow-left.png";
			}

		}






		// if the arrow is within 10 pixels of its destination stop it
		if (Math.abs(this.arrowLocation.x - this.arrowLocation.destinationX) < 10) {
			this.stopShooting();
		}



	}
	//when this is called, stop shooting and return the arrow to robinhood
	this.stopShooting = function () {
		// stop robinhood from shooting and return the arrow to teh character
		// shooting = false;
		// this.arrowFollow();
	}

}

const arrows = {

};
class Arrow {
	constructor(id, x, y, destinationX) {
		this.arrowImage = new Image();
		this.arrowImage.src = "Images/arrow-right.png";
		this.id = id;
		this.arrowLocation = {
			x,
			y,
			destinationX
		}
	}

	arrowMove = function () {
		//if the arrow is not within 10 pixels of its destination, keep it going
		const movementBounds = {
			x1: 80,
			x2: 520,
			y1: 30,
			y2: 390
		}

		// don't let arrow go off map
		if (this.arrowLocation.x > movementBounds.x2) {
			console.log("ARROW OFF X MAP")
			// TODO: add logic to remove arrow from lookup
		}

		if (this.arrowLocation.x < movementBounds.x1) {
			console.log("ARROW OFF X2 MAP")
		}

		if (this.arrowLocation.x < this.arrowLocation.destinationX) {

			console.log('shooting new arrow function', shooting)
			console.log('this.arrowLocation', this.arrowLocation)
			this.arrowLocation.x += 6;
			const a = this.arrowLocation.x += 6;
			console.log('$$$$$$$$$$$$$$$$$$ARROW LOCATION$', a)


		}

		if (this.arrowLocation.x > this.arrowLocation.destinationX) {

			console.log('shooting', shooting)
			console.log('this.arrowLocation', this.arrowLocation)
			this.arrowLocation.x -= 6;
			const a = this.arrowLocation.x -= 6;
			console.log('$$$$$$$$$$$$$$$$$$ARROW LOCATION$', a)


		}
	}
}
// ----------------------------------------------------------
// ------------MONSTER AND ALLY CONSTRUCTORS BELOW-----------
// ----------------------------------------------------------


class Enemy {
	constructor() {

	}
	showHeroHurtOverlay = function() {
		document.getElementById("hurtByEnemy").style.opacity = .5;
			setTimeout(() => {
				document.getElementById("hurtByEnemy").style.opacity = 0;
			}, 200)
	}	
}

class Goblin extends Enemy {
	constructor(name) {
		super()
		this.name = name;
		this.health = 3;
		this.image = new Image();
		this.image.src = "possible-enemies-allies/royalty goblin.png"
		this.speed = 1;
		this.x = Math.random() * 440 + 40;;
		this.y = Math.random() * 400 + 20;
		this.destinationX = Math.random() * 440 + 40;
		this.destinationY = Math.random() * 400 + 20;
		this.move = function () {
			if (Math.abs(this.x - this.destinationX) < 32) {
				this.destinationX = Math.random() * 440 + 40;
			} else if (this.x < this.destinationX) {
				this.x += 2.94 * this.speed;
				this.image.src = "possible-enemies-allies/royalty-goblin-right.png";
			} else {
				this.x -= 2.94 * this.speed;
				this.image.src = "possible-enemies-allies/royalty goblin-left.png";
			}
	
			if (Math.abs(this.y - this.destinationY) < 32) {
				this.destinationY = Math.random() * 400 + 20;
			} else if (this.y > this.destinationY) {
				this.y -= 2.94 * this.speed;
			} else {
				this.y += 2.94 * this.speed;
			}
		}
	}

	catchRobinHood = function () {
		
		// if this goblin is within 32 of robinhood, robinhood gets hurt unless goblin is a coin
		if (
			Math.abs((this.x - robinHood.x)) < 24
			&& Math.abs(this.y - robinHood.y) < 24
		) {
			this.showHeroHurtOverlay()
			//robin hoood got hit
			this.x = Math.random() * 440 + 40;
			this.y = Math.random() * 400 + 20;
			robinHood.health--;						
			
			document.getElementById("health").innerHTML = robinHood.health;
		}
	}
	getHitByArrow = function () {
		if (
			Math.abs(robinHood.arrowLocation.x - this.x) < 15
			&& Math.abs(robinHood.arrowLocation.y - this.y) < 28
			&& shooting === true
		) {
			// if the goblin gets hit by the arrow, it loses health, robinhood stops shooting and teh goblin slows
			this.health -= arrowDamage;
			shooting = false;
			robinHood.stopShooting();
			this.changeSpeed();
		}
	}

	getHitByNinjaStar = function () {
		for (var i = 0; i < ninjaArray.length; i++) {
			if (
				Math.abs(ninjaArray[i].ninjaStarLocation.x - this.x) < 15
				&& Math.abs(ninjaArray[i].ninjaStarLocation.y - this.y) < 30
				&& ninjaArray[i].throwing === true
			) {
				// if the goblin gets hit by the arrow, it loses health, robinhood stops shooting and teh goblin slows
				this.health -= ninjaStarDamage;
				ninjaArray[i].throwing = false;
				ninjaArray[i].stopThrowing();
				this.changeSpeed();
			}
		}
	}


	//changes the speed of the goblin and changes them to a coin if dead
	changeSpeed = function () {
		if (this.health == 2) {
			this.speed = .7;
		} else if (this.health == 1) {
			this.speed = .2;
		} else if (this.health <= 0) {
			var goblinNumber = this.name.slice(6);

			//change property in goblin array to do nothing
			// goblinArray[goblinNumber] = "do nothing";

			// change image source to nothing and increase gold
			this.image.src = "";
			robinHood.gold += 5;
			document.getElementById("gold-collected").innerHTML = robinHood.gold;

			// CHANGE TEXT DISPLAY TO GOLD BEFOE DISPLAYING
			document.getElementById("textDisplay").style.color = "goldenRod";
			document.getElementById("textDisplay").innerHTML = "You collected " + 5 + " gold!";

			// clear the text display after 3 seconds
			setTimeout(clearDisplay, 3000);
		}
	}

}

class Thug extends Enemy {
	constructor(name) {
		super()
		this.name = name;
		this.health = 6;
		this.image = new Image();
		this.image.src = "possible-enemies-allies/thug.png";
		this.speed = 1;
		this.x = this.x = Math.random() * 440 + 40;
		this.y = this.y = Math.random() * 400 + 20;
		this.move = function () {
			if (Math.abs(this.x - robinHood.x) < 18) {
				this.catchRobinHood();
			} else if (this.x <= robinHood.x) {
				this.x += 2 * this.speed;
				this.image.src = "possible-enemies-allies/thug.png";
			} else {
				this.x -= 2 * this.speed;
				this.image.src = "possible-enemies-allies/thug-left.png";
			}
	
			if (Math.abs(this.y - robinHood.y) < 24) {
				this.catchRobinHood();
			} else if (this.y > robinHood.y) {
				this.y -= 2 * this.speed;
	
	
			} else {
				this.y += 2 * this.speed;
			}
		}
	}


	catchRobinHood = function () {
		// if this goblin is within 32 of robinhood, robinhood gets hurt unless goblin is a coin
		if (
			Math.abs((this.x - robinHood.x)) < 18
			&& Math.abs(this.y - robinHood.y) < 24
		) {
			this.showHeroHurtOverlay();
			//generate new location if you hit him
			//robin hoood got hit
			this.x = Math.random() * 440 + 40;
			this.y = Math.random() * 400 + 20;
			robinHood.health--;
			document.getElementById("health").innerHTML = robinHood.health;
		}

	}
	getHitByArrow = function () {
		if (
			Math.abs(robinHood.arrowLocation.x - this.x) < 15
			&& Math.abs(robinHood.arrowLocation.y - this.y) < 33
			&& shooting === true
		) {
			// if the goblin gets hit by the arrow, it loses health, robinhood stops shooting and teh goblin slows
			this.health -= arrowDamage;
			shooting = false;
			robinHood.stopShooting();
			this.changeSpeed();
		}
	}

	getHitByNinjaStar = function () {
		for (var i = 0; i < ninjaArray.length; i++) {
			if (
				Math.abs(ninjaArray[i].ninjaStarLocation.x - this.x) < 15
				&& Math.abs(ninjaArray[i].ninjaStarLocation.y - this.y) < 30
				&& ninjaArray[i].throwing === true
			) {
				// if the goblin gets hit by the arrow, it loses health, robinhood stops shooting and teh goblin slows
				this.health -= ninjaStarDamage;
				ninjaArray[i].throwing = false;
				ninjaArray[i].stopThrowing();
				this.changeSpeed();
			}
		}
	}
	//changes the speed of the goblin and changes them to a coin if dead
	changeSpeed = function () {
		if (this.health == 5) {
			this.speed = .7;
		} else if (this.health == 3) {
			this.speed = .3;
		} else if (this.health == 1) {
			this.speed = .05;
		}
		else if (this.health <= 0) {
			// var thugNumber = this.name.slice(4);			

			//change property in thug array to do nothing
			// thugArray[thugNumber] = "do nothing";

			// change image source to nothing and increase gold
			this.image.src = "";
			robinHood.gold += 7;
			document.getElementById("gold-collected").innerHTML = robinHood.gold;

			//display the amount of gold Collected for 2 seconds
			document.getElementById("textDisplay").style.color = "goldenRod";
			document.getElementById("textDisplay").innerHTML = "You collected " + 7 + " gold!";

			// clear the text display after 2 seconds
			setTimeout(clearDisplay, 3000); //update the counter every second

		}
	}

}
//let's create a golem
class Golem extends Enemy {

	constructor(name) {
		super()
		this.name = name;
		this.health = 80;
		this.image = new Image();
		this.image.src = "possible-enemies-allies/golem1.png";
		this.speed = 1;
		this.x = 300;
		this.y = 200;
		this.move = function () {
			if (Math.abs(this.x - robinHood.x) < 32) {
				this.catchRobinHood();
			} else if (this.x < robinHood.x) {
				this.x += 1.3 * this.speed;
				this.image.src = "possible-enemies-allies/golem1.png";
			} else {
				this.x -= 1.3 * this.speed;
				this.image.src = "possible-enemies-allies/golem-face-left.png";
			}
	
			if (Math.abs(this.y - robinHood.y) < 32) {
				this.catchRobinHood();
			} else if (this.y > robinHood.y) {
				this.y -= 1.3 * this.speed;
			} else {
				this.y += 1.3 * this.speed;
			}
		}
	}

	catchRobinHood = function () {
		// if this goblin is within 32 of robinhood, robinhood gets hurt unless goblin is a coin
		if (
			Math.abs((this.x - robinHood.x)) < 32
			&& Math.abs(this.y - robinHood.y) < 32
		) {
			this.showHeroHurtOverlay();
			//generate new location if you hit him
			//robin hoood got hit
			this.x = Math.random() * 440 + 40;
			this.y = Math.random() * 400 + 20;
			robinHood.health--;
			
			document.getElementById("health").innerHTML = robinHood.health;
		}

	}
	getHitByArrow = function () {
		if (
			Math.abs(robinHood.arrowLocation.x - this.x) < 30
			&& Math.abs(robinHood.arrowLocation.y - this.y) < 70
			&& shooting === true
		) {
			// if the goblin gets hit by the arrow, it loses health, robinhood stops shooting and teh goblin slows
			this.health -= arrowDamage;
			shooting = false;
			robinHood.stopShooting();
			this.changeSpeed();
		}
	}

	getHitByNinjaStar = function () {

		for (var i = 0; i < ninjaArray.length; i++) {
			if (
				Math.abs(ninjaArray[i].ninjaStarLocation.x - this.x) < 20
				&& Math.abs(ninjaArray[i].ninjaStarLocation.y - this.y) < 70
				&& ninjaArray[i].throwing === true
			) {
				// if the goblin gets hit by the arrow, it loses health, robinhood stops shooting and teh goblin slows
				this.health -= ninjaStarDamage;
				ninjaArray[i].throwing = false;
				ninjaArray[i].stopThrowing();
				this.changeSpeed();
			}
		}

	}

	//changes the speed of the goblin and adds gold if dead


	changeSpeed = function () {
		if (this.health == 50) {
			this.speed = .4;
		} else if (this.health == 20) {
			this.speed = .2;
		} else if (this.health == 5) {
			this.speed = .05;
		}
		else if (this.health <= 0) {
			// var golemNumber = this.name.slice(5);


			//change property in thug array to do nothing
			// golemArray[golemNumber] = "do nothing";

			// change image source to nothing and increase gold
			this.image.src = "";
			robinHood.gold += 40;
			document.getElementById("gold-collected").innerHTML = robinHood.gold;

			//display the amount of gold Collected for 2 seconds
			document.getElementById("textDisplay").style.color = "goldenRod";
			document.getElementById("textDisplay").innerHTML = "You collected " + 40 + " gold!";

			// clear the text display after 3 seconds
			setTimeout(clearDisplay, 3000); //update the counter every second

		}
	}

}


// NINJA CONSTRUCTOR!!! 
//RK to come back and make this a prototype
var ninjaStarDamage = 40;

function Ninja(name) {
	this.name = name;
	this.image = new Image();
	this.image.src = "possible-enemies-allies/ninja2.png";
	this.ninjaStarImage = new Image();
	this.ninjaStarImage.src = "possible-enemies-allies/ninja-star.png"
	this.ninjaStarLocation = {
		x: 329,
		y: 229,
		destinationX: 0,
		destinationY: 0
	}

	this.speed = 1;
	this.x = 300;
	this.y = 200;
	this.destinationX = Math.random() * 440 + 40;
	this.destinationY = Math.random() * 400 + 20;
	this.faceLeft = false;
	this.throwing = false;
	//create a variable that tracks when the ninja threw the star
	this.throwStar = false


	this.move = function () {

		// if he hits his destination, generate a new one
		// if he is throwing, stop and throw until throw is complete
		if (Math.abs(this.x - this.destinationX) < 32) {
			this.destinationX = Math.random() * 440 + 40;
		} else if (this.x < this.destinationX && !this.throwing) {
			this.x += 2.00 * this.speed;
			this.image.src = "possible-enemies-allies/ninja2.png";
			this.faceLeft = false;
		} else if (this.x > this.destinationX && !this.throwing) {
			this.x -= 2.00 * this.speed;
			this.image.src = "possible-enemies-allies/ninja2-left.png";
			this.faceLeft = true;
		}

		if (Math.abs(this.y - this.destinationY) < 32) {
			this.destinationY = Math.random() * 400 + 20;
			//throw the star if he reaches the y destination
			this.ninjaStarThrow();
		} else if (this.y > this.destinationY && !this.throwing) {
			this.y -= 2.00 * this.speed;
		} else if (this.y < this.destinationY && !this.throwing) {
			this.y += 2.00 * this.speed;

		}
	}

	//ninja star should follow the ninja as long as he is not throwing it 
	this.ninjaStarFollow = function () {
		if (!this.throwing) {
			if (this.faceLeft) {
				this.ninjaStarLocation.x = this.x + 29;
				this.ninjaStarLocation.y = this.y + 29;

			} else if (!this.faceLeft) {
				this.ninjaStarLocation.x = this.x + 18;
				this.ninjaStarLocation.y = this.y + 29;

			}
		}

	}

	// sets a new destination for the ninja star and stop the ninja from moving by setting throwing to true
	this.ninjaStarThrow = function () {
		// when this is called throw star
		this.throwing = true;

		// if he is on the right side of the map throw left
		if (this.x > 300) {
			// throw left and turn left
			this.ninjaStarLocation.destinationX = this.ninjaStarLocation.x - 300;
			this.image.src = "possible-enemies-allies/ninja2-left.png";
			// set it to false so that the star can actually come back to the ninja
			// this.throwStar = false;
		} else if (this.x < 301) {
			// throw right and turn right
			this.image.src = "possible-enemies-allies/ninja2.png";
			this.ninjaStarLocation.destinationX = this.ninjaStarLocation.x + 300;
			// this.throwStar = false;
		}
	}



	//make star move or stop 

	this.moveNinjaStar = function () {
		if (Math.abs(this.ninjaStarLocation.x - this.ninjaStarLocation.destinationX) < 30) {
			this.stopThrowing();
		} else {
			// 	//if the ninjaStar is not within 10 pixels of its destination, keep it going
			if (this.ninjaStarLocation.x < this.ninjaStarLocation.destinationX && this.throwing == true) {

				this.ninjaStarLocation.x += 3;

			} else if (this.ninjaStarLocation.x > this.ninjaStarLocation.destinationX && this.throwing == true) {
				this.ninjaStarLocation.x -= 3;
			}
		}

	}


	// if the ninjaStar is within 10 pixels of its destination stop throwing


	this.stopThrowing = function () {
		console.log("hi");
		this.throwing = false;
		this.ninjaStarFollow();
		// this.throwStar = false;
	}
}


function clearDisplay() {
	document.getElementById("textDisplay").innerHTML = "&nbsp";
	// var counterInterval = setInterval(updateCounter, 1000); //update the counter every second


	//change it back to red for game over after display
	document.getElementById("textDisplay").style.color = "red";




}







// ----------------------------------------------------------
// ----create Heros, Monsters and Allies below---------------
// ----------------------------------------------------------



//create robinhood - create an image object and send it through to the constructore




// ----------------------GOBLINS-----------------------------
var goblinInterval, thugInterval, golemInterval;



// var goblinInterval = setInterval(generateGoblinNumber, 5000);




var goblin0 = new Goblin("goblin0");
var goblin1 = new Goblin("goblin1");



var goblinNumber = 2;

function generateGoblin() {
	var newGoblinName = "goblin" + goblinNumber;
	var newGoblin = new Goblin(newGoblinName);
	goblinArray.push(newGoblin);
	goblinNumber++;
}

// create a goblin array
var goblinArray = [];
goblinArray.push(goblin0, goblin1);

// ----------------------THUGS-----------------------------
// var thugInterval = setInterval(generateThugNumber, 7000);


var thugArray = [];
var thug0 = new Thug("thug0");
thugArray.push(thug0);
var thugNumber = 1;


function generateThug() {
	var newThugName = "thug" + thugNumber;
	var newThug = new Thug(newThugName);
	thugArray.push(newThug);
	thugNumber++

}
// ----------------------GOLEMS-----------------------------

// var golemInterval = setInterval(generateGolemNumber, 35000);

//create a golem
// var golem0 = new Golem("golem0");
//empty golemArray and then you push golem0 to the golem array  
var golemArray = [];
// golemArray.push(golem0);
var golemNumber = 0;

// function generateGolemNumber(){
// 	var newGolem = "golem" + golemNumber;
// 	golemNumber++;
// 	generateGolem(newGolem);
// }

function generateGolem() {
	var newGolemName = "golem" + golemNumber;
	var newGolem = new Golem(newGolemName);
	golemArray.push(newGolem);
	golemNumber++;

}

// HERO section
var robinHood = new Hero("Robin Hood", "possible-enemies-allies/archer3.png", 1);

//let's create some NINJAs when the user hires them


// ----------------------------------------------------------
// ----------------Instructions Section here-----------------
// ----------------------------------------------------------

var modalInstructions = document.getElementById('modal-instructions');
var closeInstructions = document.getElementsByClassName("close-instructions")[0];

function viewInstructions() {
	modalInstructions.style.display = "block";
	pauseGame();
}

closeInstructions.onclick = function () {
	modalInstructions.style.display = "none";
}

//ask rob
window.onclick = function (event) {
	if (event.target == modalInstructions) {
		modalInstructions.style.display = "none";
	}
}

// ----------------------------------------------------------
// ----------------Shop Section here-------------------------
// ----------------------------------------------------------

// get modal
var modalShop = document.getElementById('modal-shop');

// Get the <span> element that closes the modal
var leaveShop = document.getElementsByClassName("close-shop")[0];

// When the user clicks on the button, open the modal 
function openShop() {
	// when the user opens the shop, change the display to block
	modalShop.style.display = "block";
	// pause the game
	pauseGame();
}

// When the user clicks on <span> (x), close the modal
leaveShop.onclick = function () {
	modalShop.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
	if (event.target == modalShop) {
		modalShop.style.display = "none";
	}
}



//after the user opens up shop - below is the code for using / purchasing items after 

// create functions that enable and disable purchasing buttons depending on robinhood's gold
function disableButton(buttonString) {
	var button = document.getElementById(buttonString);
	button.disabled = true;
}

function enableButton(buttonString) {
	var button = document.getElementById(buttonString);
	button.disabled = false;
}

// check to see what robinHood can purchase
function checkPurchasingAbility() {
	if (robinHood.gold < 50) {
		disableButton("health-potion-button");
		disableButton("speed-potion-button");
		disableButton("fire-arrows-button");
		// disableButton("ninja-button");
	} else if (robinHood.gold < 300) {
		disableButton("speed-potion-button");
		disableButton("fire-arrows-button");
		// disableButton("ninja-button");
	} else if (robinHood.gold < 500) {
		disableButton("speed-potion-button");
		// disableButton("ninja-button");
	} else if (robinHood.gold < 80) {
		disableButton("ninja-button");
	}
}



function drinkHealthPotion() {
	// when user buys and drinks potion, increase health by 3, decrease gold by 50
	robinHood.health += 3;
	robinHood.gold -= 50;
	document.getElementById("health").innerHTML = robinHood.health;
	document.getElementById("gold-collected").innerHTML = robinHood.gold;
	checkPurchasingAbility();
}

var ninjaArray = [];
var ninjaNumber = 0;
// create ninja generator
function hireNinja() {
	console.log("NINJA HIRED")
	var newNinjaName = "ninja" + ninjaNumber;
	var newNinja = new Ninja(newNinjaName);
	ninjaArray.push(newNinja);
	ninjaNumber++;
	robinHood.gold -= 80;
	document.getElementById("gold-collected").innerHTML = robinHood.gold;
	checkPurchasingAbility();
}

function drinkSpeedPotion() {
	robinHood.speed = 1.9;
	robinHood.gold -= 500;
	document.getElementById("gold-collected").innerHTML = robinHood.gold;

	document.getElementById("textDisplay").innerHTML = "SPEED BOOST!";
	document.getElementById("textDisplay").style.color = "green";
	setTimeout(clearDisplay, 8000);
	disableButton('speed-potion-button')
	checkPurchasingAbility();


}

function giveHeroFireArrows() {
	// increase arrow damage to 2
	arrowDamage = 2;
	//change arrow image source to fire arrows - logic above is already chagned
	if (robinHood.faceLeft === true) {
		robinHood.arrowImage.src = "Images/flaming-arrow2 left.png"
	} else {
		robinHood.arrowImage.src = "Images/flaming-arrow2.png"
	}

	//tell teh user what just happened

	robinHood.gold -= 300;
	document.getElementById("gold-collected").innerHTML = robinHood.gold;

	document.getElementById("textDisplay").innerHTML = "FLAMING ARROWS IGNITED!";
	document.getElementById("textDisplay").style.color = "firebrick";
	setTimeout(clearDisplay, 8000);

	//disable fire arrows - don't want user to buy them twice! 
	disableButton('fire-arrows-button')
	checkPurchasingAbility();

}




robinHood.gold += 100;


// ----------------------------------------------------------
// ----------------UPDATE AND DRAW SECTIONS BELOW------------
// ----------------------------------------------------------


function update() {
	userPause(keysPressed);
	robinHood.move(keysPressed);
	// robinHood.arrowMove()
	console.log("UPDATE SHOOTING", shooting)
	// robinHood.shoot(keysPressed);
	robinHood.shoot(keyQueue);
	robinHood.arrowFollow();
	checkGameStatus(robinHood.health);
	checkIfHighScore();


	console.log('ninja', ninjaArray)

	for (const key in arrows) {

		arrows[key].arrowMove()
	  }

	for (var i = 0; i < ninjaArray.length; i++) {
		ninjaArray[i].move();
		ninjaArray[i].moveNinjaStar();
		ninjaArray[i].ninjaStarFollow();
	}

	// a for loop that goes through all necessary updates for all goblins
	for (var i = 0; i < goblinArray.length; i++) {
		if (goblinArray[i].health <= 0) {
			// if the goblin's health is less than 0, there is no need to check to see if it got hit by anythig, whether it caught robinhood or make it move
		} else {

			// if the goblin has more than 0 health move it and check to see the others			
			goblinArray[i].move();
			goblinArray[i].catchRobinHood();
			goblinArray[i].getHitByNinjaStar();
			goblinArray[i].getHitByArrow();
		}

	}
	//a for loop that goes through all necessary updates for all thugs
	for (var i = 0; i < thugArray.length; i++) {

		if (thugArray[i].health <= 0) {
			//do not move or allow this thug to get hit by arrows/ninja stars if his health is less than or equal to 0
		} else {
			// if it has greater than 0 health, it can move, get hit by ninja stars or catch robinhood
			thugArray[i].move();
			thugArray[i].getHitByArrow();
			thugArray[i].getHitByNinjaStar();
		}
	}

	for (var i = 0; i < golemArray.length; i++) {

		if (golemArray[i].health <= 0) {

		} else {
			golemArray[i].move();
			golemArray[i].getHitByArrow();
			golemArray[i].getHitByNinjaStar();
		}
	}

}


//end game if player has 0 or less health
function checkGameStatus(health) {
	if (health <= 0) {
		//you lost
		gameOn = false;
		document.getElementById("textDisplay").innerHTML = "GAME OVER";
		monsterIntervalManager(true);
		disableButton("pause-button");
		disableButton("resume-button");
		disableButton("open-shop-button");
	}
}
// need to draw the image constantly

function draw() {

	// recursively call draw 
	requestAnimationFrame(draw);

	if (gameOn) {
		update();
	} else {
		clearInterval(counterInterval);
	}


	context.drawImage(backgroundImage, 0, 0);
	// context.drawImage(golem0.image, golem0.x, golem0.y);
	context.drawImage(robinHood.image, robinHood.x, robinHood.y);

	console.log('robinhood.arrowlocation', robinHood.arrowLocation)
	context.drawImage(robinHood.arrowImage, robinHood.arrowLocation.x, robinHood.arrowLocation.y);
	

	// draw arrows on the screen
	// let logCount = 0
	// arrows.forEach(arrow => {
	// 	if (logCount > 50) {
	// 		console.log(arrow, 'arrow'); // Log each individual arrow object
	// 	}
	// 	context.drawImage(arrow.image, arrow.arrowLocation.x, arrow.arrowLocation.y);
	// });
	
	//a for loop that draws and moves all the goblins in the arrray
	for (var i = 0; i < goblinArray.length; i++) {

		if (goblinArray[i].health > 0) {
			context.drawImage(goblinArray[i].image, goblinArray[i].x, goblinArray[i].y);
		} 
	}
	// Draw the thug on the page

	for (var i = 0; i < thugArray.length; i++) {
		if (thugArray[i].health > 0) {
			context.drawImage(thugArray[i].image, thugArray[i].x, thugArray[i].y);
		} 
	}

	for (var i = 0; i < golemArray.length; i++) {

		if (golemArray[i].health > 0) {
			context.drawImage(golemArray[i].image, golemArray[i].x, golemArray[i].y);

		} 
	}

	// drawing ninjas on the screen in addition to each one of their ninja star locations
	for (var i = 0; i < ninjaArray.length; i++) {
		context.drawImage(ninjaArray[i].image, ninjaArray[i].x, ninjaArray[i].y);
		context.drawImage(ninjaArray[i].ninjaStarImage, ninjaArray[i].ninjaStarLocation.x, ninjaArray[i].ninjaStarLocation.y);

	}

}
//
draw();



