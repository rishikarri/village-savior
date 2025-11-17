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

// HELPER FUNCTIONS 

function generateUniqueId() {
	// Generate a random string using a combination of characters
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 16; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}


function deleteObjectByKey(obj, keyToDelete) {
	if (obj.hasOwnProperty(keyToDelete)) {
		delete obj[keyToDelete];
		return true; // Indicate successful deletion
	}
	return false; // Indicate that the key was not found
}


  

// GLOBAL VARS
let useFireArrows = false; 
var score = 0;

counterInterval = setInterval(updateCounter, 1000);

function updateCounter() {

	score++;

	document.getElementById("scoreKeeper").innerHTML = "Score: " + score;

}


var highScore = localStorage.getItem("highScore");
document.getElementById("highScoreKeeper").innerHTML = "High Score: " + (highScore || 0);
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
		clearInterval(banditInterval);
		clearInterval(golemInterval);
	} else {
		//clear interval and then set it incase user presses resume multiple times
		clearInterval(goblinInterval);
		clearInterval(banditInterval);
		clearInterval(golemInterval);

		goblinInterval = setInterval(generateGoblin, 5000);
		banditInterval = setInterval(generateBandit, 7000);
		golemInterval = setInterval(generateGolem, 35000);
	}
}

function startGame() {

	//set hero's health to 20  when the game starts
	// refresh teh page to start a new game
	location.reload();
	viewInstructions()
}


function userPause() {
	// if (32 in keysPressed) {
	// 	togglePause();
	// }
}

let gamePaused = false; // Flag to track pause state
const pauseResumeButton = document.getElementById('pause-resume-button');
function togglePause() {
    gamePaused = !gamePaused; // Toggle the pause state

    if (gamePaused) {
      pauseResumeButton.textContent = "Resume";
      pauseGame(); // Call your pause game function
    } else {
      pauseResumeButton.textContent = "Pause";
      resumeGame(); // Call your resume game function
    }
  }
function pauseGame() {
	gameOn = false;
	monsterIntervalManager(true);
}

function resumeGame() {
	gameOn = true;
	counterInterval = setInterval(updateCounter, 1000); //update the counter every second
	monsterIntervalManager(false);
	// var goblinInterval = setInterval(generateGoblinNumber, 5000);
	// var golemInterval = setInterval(generateGolemNumber, 35000);
	// var thugInterval = setInterval(generateThugNumber, 7000);
}

function openShop() {
	// pause ggame so it's not running in the background
	gameOn = false;
	monsterIntervalManager(false);

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
	console.log('keyQueue', keyQueue) // @TODO - add logs only if there's LOGLEVEL=DEBUG env var 

	keysPressed[event.keyCode] = true; //this position of the array has a position of true
})

//CREATE CONSTRUCTORS
//

//create a Hero constructor - takes in a name and an image to create a new one, for now we will only create one
var arrowDamage = 1;
function Hero(name, image, speed) {
	this.name = name;
	this.health = 6;
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
		if (this.faceLeft) {
			this.arrowLocation.x = this.x - 4;
			this.arrowLocation.y = this.y + 18;

		}

		if (!this.faceLeft) {
			this.arrowLocation.x = this.x + 22;
			this.arrowLocation.y = this.y + 18;

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
		}

		if (this.arrowLocation.x < movementBounds.x1) {
			console.log("ARROW OFF X2 MAP")
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

				this.arrowLocation.x = this.x - 4;
				this.arrowLocation.y = this.y + 18;
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
				// if the spacebar is hit, shoot the arrow 50 pixels right, user can hold it to make it go farther
				let addDistanceCounter = 1;

				const arrowId = generateUniqueId();
				const newArrowRight = new Arrow(arrowId, robinHood.x - 1, robinHood.y + 18, robinHood.x + 450, 'RIGHT')

				arrows[arrowId] = newArrowRight

				console.log('arrows', arrows)

				// this.arrowLocation.destinationX = this.arrowLocation.x + 450;

				// console.log('this.arrowLocation', this.arrowLocation)


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



				const arrowId = generateUniqueId();
				const newArrow = new Arrow(arrowId, robinHood.x - 4, robinHood.y + 18, robinHood.x - 450, 'LEFT')

				arrows[arrowId] = newArrow



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
	}
	// this.shoot = throttle(this._shoot.bind(this), 500);


}

const arrows = {

};
class Arrow {
	constructor(id, x, y, destinationX, arrowDirection) {
		this.id = id;
		this.image = new Image();
		this.image.src = "Images/arrow-right.png";
		this.hitEnemy = false;
		this.arrowDirection = arrowDirection;
		if (useFireArrows) {
			console.log("FIRE ARROW")
			if (arrowDirection === "LEFT") {
				this.image.src = "Images/flaming-arrow2 left.png"
			} 
			if (arrowDirection === 'RIGHT') {
				this.image.src = "Images/flaming-arrow2.png"
			}

		} else {
			if (arrowDirection === "LEFT") {
				this.image.src = "Images/arrow-left.png"; // Image for left direction
			}
		}


		this.arrowLocation = {
			x,
			y,
			destinationX
		}
	}

	arrowMove = function () {
		if (this.hitEnemy) return;
		//if the arrow is not within 10 pixels of its destination, keep it going
		const movementBounds = {
			x1: 70,
			x2: 520,
			y1: 30,
			y2: 390
		}

		// don't let arrow go off map
		console.log(this, 'arrows ******')
		if (this.arrowLocation.x > movementBounds.x2 && this.arrowDirection === 'RIGHT') {
			console.log("ARROW OFF X MAP")

			deleteObjectByKey(arrows, this.id)
		}

		if (this.arrowLocation.x < movementBounds.x1) {
			console.log("ARROW OFF X2 MAP")
			deleteObjectByKey(arrows, this.id)
		}

		if (this.arrowLocation.x < this.arrowLocation.destinationX && this.arrowDirection === 'RIGHT') {

			console.log('this.arrowLocation', this.arrowLocation)
			this.arrowLocation.x += 6;
			const a = this.arrowLocation.x += 6;
			console.log('$$$$$$$$$$$$$$$$$$ARROW LOCATION$', a)


		}

		if (this.arrowLocation.x > this.arrowLocation.destinationX && this.arrowDirection === 'LEFT') {

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
	constructor(name, health, imageSrc, speed, goldReward) {
		this.name = name;
		this.health = health;
		this.maxHealth = health; // Store max health for health bar calculation
		this.image = new Image();
		this.image.src = imageSrc;
		this.speed = speed;
		this.goldReward = goldReward;
		this.x = Math.random() * 440 + 40;
		this.y = Math.random() * 400 + 20;
	}

	showHeroHurtOverlay = function () {
		document.getElementById("hurtByEnemy").style.opacity = .5;
		setTimeout(() => {
			document.getElementById("hurtByEnemy").style.opacity = 0;
		}, 200)
	}

	// Common method for checking arrow collisions - can be overridden for different hitboxes
	getHitByArrow = function () {
		let currentArrow;
		for (const key in arrows) {
			currentArrow = arrows[key];
			const hitboxX = this.getArrowHitboxX();
			const hitboxY = this.getArrowHitboxY();

			if (
				Math.abs(currentArrow.arrowLocation.x - this.x) < hitboxX
				&& Math.abs(currentArrow.arrowLocation.y - this.y) < hitboxY
			) {
				if (!currentArrow.hitEnemy) {
					this.health -= arrowDamage;
					currentArrow.hitEnemy = true;
					deleteObjectByKey(arrows, currentArrow.id);
					this.changeSpeed();
				}
			}
		}
	}

	// Common method for checking ninja star collisions - can be overridden for different hitboxes
	getHitByNinjaStar = function () {
		for (var i = 0; i < ninjaArray.length; i++) {
			const hitboxX = this.getNinjaStarHitboxX();
			const hitboxY = this.getNinjaStarHitboxY();

			if (
				Math.abs(ninjaArray[i].ninjaStarLocation.x - this.x) < hitboxX
				&& Math.abs(ninjaArray[i].ninjaStarLocation.y - this.y) < hitboxY
				&& ninjaArray[i].throwing === true
			) {
				this.health -= ninjaStarDamage;
				ninjaArray[i].throwing = false;
				ninjaArray[i].stopThrowing();
				this.changeSpeed();
			}
		}
	}

	// Common method for catching robin hood - can be overridden for different thresholds
	catchRobinHood = function () {
		const thresholdX = this.getCatchThresholdX();
		const thresholdY = this.getCatchThresholdY();
		const minScore = this.getMinScoreForCatch();

		if (score > minScore) {
			if (
				Math.abs((this.x - robinHood.x)) < thresholdX
				&& Math.abs(this.y - robinHood.y) < thresholdY
			) {
				this.showHeroHurtOverlay();
				this.x = Math.random() * 440 + 40;
				this.y = Math.random() * 400 + 20;
				robinHood.health--;
				document.getElementById("health").innerHTML = robinHood.health;
			}
		}
	}

	// Default move implementation - chases the hero
	// Can be overridden by subclasses for different movement patterns
	move() {
		const moveSpeed = this.getMoveSpeed();
		const thresholdX = this.getCatchThresholdX();
		const thresholdY = this.getCatchThresholdY();

		// Check X direction
		if (Math.abs(this.x - robinHood.x) < thresholdX) {
			this.catchRobinHood();
		} else if (this.x < robinHood.x) {
			this.x += moveSpeed * this.speed;
			this.updateSpriteDirection('right');
		} else {
			this.x -= moveSpeed * this.speed;
			this.updateSpriteDirection('left');
		}

		// Check Y direction
		if (Math.abs(this.y - robinHood.y) < thresholdY) {
			this.catchRobinHood();
		} else if (this.y > robinHood.y) {
			this.y -= moveSpeed * this.speed;
		} else {
			this.y += moveSpeed * this.speed;
		}
	}

	// Helper method to update sprite direction - can be overridden
	updateSpriteDirection(direction) {
		// Default implementation - subclasses should override with their specific sprites
	}

	// Get movement speed multiplier - can be overridden
	getMoveSpeed() {
		return 2; // Default movement speed multiplier
	}

	changeSpeed() {
		// Default implementation - handle death
		if (this.health <= 0) {
			this.image.src = "";
			robinHood.gold += this.goldReward;
			document.getElementById("gold-collected").innerHTML = robinHood.gold;
			document.getElementById("textDisplay").style.color = "goldenRod";
			document.getElementById("textDisplay").innerHTML = "You collected " + this.goldReward + " gold!";
			setTimeout(clearDisplay, 3000);
		}
	}

	// Methods to override for different hitboxes and thresholds
	getArrowHitboxX() {
		return 15; // Default hitbox
	}

	getArrowHitboxY() {
		return 28; // Default hitbox
	}

	getNinjaStarHitboxX() {
		return 15; // Default hitbox
	}

	getNinjaStarHitboxY() {
		return 30; // Default hitbox
	}

	getCatchThresholdX() {
		return 24; // Default threshold
	}

	getCatchThresholdY() {
		return 24; // Default threshold
	}

	getMinScoreForCatch() {
		return 3; // Default minimum score
	}

	// Draw health bar underneath the enemy
	drawHealthBar(ctx) {
		if (this.health <= 0) return; // Don't draw if dead

		const barWidth = this.getHealthBarWidth(); // Width of the health bar
		const barHeight = this.getHealthBarHeight(); // Height of the health bar
		const barOffsetY = this.getHealthBarOffsetY(); // Offset below the enemy sprite
		const estimatedSpriteWidth = this.image.width || this.getEstimatedSpriteWidth();
		const barX = this.x + estimatedSpriteWidth / 2 - barWidth / 2; // Center the bar
		const barY = this.y + barOffsetY;

		// Calculate health percentage
		const healthPercent = Math.max(0, this.health / this.maxHealth);

		// Draw background (red/dark)
		ctx.fillStyle = '#8B0000'; // Dark red background
		ctx.fillRect(barX, barY, barWidth, barHeight);

		// Draw health (green to red gradient based on health)
		if (healthPercent > 0.5) {
			ctx.fillStyle = '#00FF00'; // Green when above 50%
		} else if (healthPercent > 0.25) {
			ctx.fillStyle = '#FFFF00'; // Yellow when between 25-50%
		} else {
			ctx.fillStyle = '#FF0000'; // Red when below 25%
		}
		ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

		// Draw border
		ctx.strokeStyle = '#000000';
		ctx.lineWidth = 1;
		ctx.strokeRect(barX, barY, barWidth, barHeight);
	}

	// Methods to override for custom health bar sizes
	getHealthBarWidth() {
		return 40; // Default width
	}

	getHealthBarHeight() {
		return 4; // Default height
	}

	getHealthBarOffsetY() {
		return 35; // Default offset below sprite
	}

	getEstimatedSpriteWidth() {
		return 32; // Default estimated sprite width
	}
}

class Goblin extends Enemy {
	constructor(name) {
		super(name, 6, "possible-enemies-allies/royalty goblin.png", 1, 5);
		this.destinationX = Math.random() * 440 + 40;
		this.destinationY = Math.random() * 400 + 20;
	}

	move() {
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

	// Override changeSpeed to add goblin-specific speed changes
	changeSpeed() {
		if (this.health == 2) {
			this.speed = .7;
		} else if (this.health == 1) {
			this.speed = .2;
		} else if (this.health <= 0) {
			// Call parent implementation for death handling
			super.changeSpeed();
		}
	}
}

class Bandit extends Enemy {
	constructor(name) {
		super(name, 12, "possible-enemies-allies/thug.png", 1, 7);
	}

	// Override sprite direction update for bandit
	updateSpriteDirection(direction) {
		if (direction === 'right') {
			this.image.src = "possible-enemies-allies/thug.png";
		} else {
			this.image.src = "possible-enemies-allies/thug-left.png";
		}
	}

	// Override catch thresholds for bandit
	getCatchThresholdX() {
		return 18;
	}

	getCatchThresholdY() {
		return 24;
	}

	// Override changeSpeed to add bandit-specific speed changes
	changeSpeed() {
		if (this.health == 5) {
			this.speed = .7;
		} else if (this.health == 3) {
			this.speed = .3;
		} else if (this.health == 1) {
			this.speed = .05;
		} else if (this.health <= 0) {
			// Call parent implementation for death handling
			super.changeSpeed();
		}
	}
}
//let's create a golem
class Golem extends Enemy {
	constructor(name) {
		super(name, 120, "possible-enemies-allies/golem1.png", 1.2, 200);
		this.x = 300;
		this.y = 200;
	}

	// Override sprite direction update for golem
	updateSpriteDirection(direction) {
		if (direction === 'right') {
			this.image.src = "possible-enemies-allies/golem1.png";
		} else {
			this.image.src = "possible-enemies-allies/golem-face-left.png";
		}
	}

	// Override move speed for golem (slower movement)
	getMoveSpeed() {
		return 1.3;
	}

	// Override catch thresholds for golem
	getCatchThresholdX() {
		return 32;
	}

	getCatchThresholdY() {
		return 32;
	}

	// Override min score - golems can catch immediately
	getMinScoreForCatch() {
		return 0;
	}

	// Override hitboxes for golem (larger enemy)
	getArrowHitboxX() {
		return 30;
	}

	getArrowHitboxY() {
		return 70;
	}

	getNinjaStarHitboxX() {
		return 20;
	}

	getNinjaStarHitboxY() {
		return 70;
	}

	// Override health bar size for golem (larger enemy)
	getHealthBarWidth() {
		return 60; // Larger bar for golem
	}

	getHealthBarHeight() {
		return 5; // Slightly taller bar
	}

	getHealthBarOffsetY() {
		return 50; // More offset for larger sprite
	}

	getEstimatedSpriteWidth() {
		return 50; // Golem is larger
	}

	// Override changeSpeed to add golem-specific speed changes
	changeSpeed() {
		if (this.health == 50) {
			this.speed = .4;
		} else if (this.health == 20) {
			this.speed = .2;
		} else if (this.health == 5) {
			this.speed = .05;
		} else if (this.health <= 0) {
			// Override death message for golem
			this.image.src = "";
			robinHood.gold += this.goldReward;
			document.getElementById("gold-collected").innerHTML = robinHood.gold;
			document.getElementById("textDisplay").style.color = "goldenRod";
			document.getElementById("textDisplay").innerHTML = "You collected " + 40 + " gold!";
			setTimeout(clearDisplay, 3000);
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
var goblinInterval, banditInterval, golemInterval;



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

// ----------------------BANDITS-----------------------------
// var banditInterval = setInterval(generateBanditNumber, 7000);


var banditArray = [];
var bandit0 = new Bandit("bandit0");
banditArray.push(bandit0);
var banditNumber = 1;


function generateBandit() {
	var newBanditName = "bandit" + banditNumber;
	var newBandit = new Bandit(newBanditName);
	banditArray.push(newBandit);
	banditNumber++

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
	resumeGame()
	modalInstructions.style.display = "none";
}

const startGameButton = document.getElementById('start-game-button');

  startGameButton.addEventListener('click', function() {
    resumeGame()
	modalInstructions.style.display = "none";
  });

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
	resumeGame()
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
	} 
	
	if (robinHood.gold < 300) {
		disableButton("speed-potion-button");
		disableButton("fire-arrows-button");
		// disableButton("ninja-button");
	} 
	if (robinHood.gold < 500) {
		disableButton("speed-potion-button");
		// disableButton("ninja-button");
	} 
	if (robinHood.gold < 80) {
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
	useFireArrows = true;
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
	//a for loop that goes through all necessary updates for all bandits
	for (var i = 0; i < banditArray.length; i++) {

		if (banditArray[i].health <= 0) {
			//do not move or allow this bandit to get hit by arrows/ninja stars if his health is less than or equal to 0
		} else {
			// if it has greater than 0 health, it can move, get hit by ninja stars or catch robinhood
			banditArray[i].move();
			banditArray[i].getHitByArrow();
			banditArray[i].getHitByNinjaStar();
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
		disableButton("pause-resume-button");
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

	// make hero translucent for first 3 seconds 
	if (score < 3) {
		context.globalAlpha = 0.5; // Set opacity (0.0 - 1.0)
	
		context.drawImage(robinHood.image, robinHood.x, robinHood.y);
	
		context.globalAlpha = 1.0;
	} else {
		context.drawImage(robinHood.image, robinHood.x, robinHood.y);
	}

	console.log('robinhood.arrowlocation', robinHood.arrowLocation)
	// context.drawImage(robinHood.arrowImage, robinHood.arrowLocation.x, robinHood.arrowLocation.y);


	// draw arrows on the screen
	// let logCount = 0
	// arrows.forEach(arrow => {
	// 	if (logCount > 50) {
	// 		console.log(arrow, 'arrow'); // Log each individual arrow object
	// 	}
	// 	context.drawImage(arrow.image, arrow.arrowLocation.x, arrow.arrowLocation.y);
	// });

	let currentArrow;

	for (const arrowKey in arrows) {
		currentArrow = arrows[arrowKey]

		// console.log(currentArrow, 'current Arrow image')
		if (!currentArrow.hitEnemy) {
			context.drawImage(currentArrow.image, currentArrow.arrowLocation.x, currentArrow.arrowLocation.y);
		}
	}

	//a for loop that draws and moves all the goblins in the arrray
	for (var i = 0; i < goblinArray.length; i++) {

		if (goblinArray[i].health > 0) {
			context.drawImage(goblinArray[i].image, goblinArray[i].x, goblinArray[i].y);
			goblinArray[i].drawHealthBar(context);
		}
	}
	// Draw the bandit on the page

	for (var i = 0; i < banditArray.length; i++) {
		if (banditArray[i].health > 0) {
			context.drawImage(banditArray[i].image, banditArray[i].x, banditArray[i].y);
			banditArray[i].drawHealthBar(context);
		}
	}

	for (var i = 0; i < golemArray.length; i++) {

		if (golemArray[i].health > 0) {
			context.drawImage(golemArray[i].image, golemArray[i].x, golemArray[i].y);
			golemArray[i].drawHealthBar(context);
		}
	}

	// drawing ninjas on the screen in addition to each one of their ninja star locations
	for (var i = 0; i < ninjaArray.length; i++) {
		context.drawImage(ninjaArray[i].image, ninjaArray[i].x, ninjaArray[i].y);
		context.drawImage(ninjaArray[i].ninjaStarImage, ninjaArray[i].ninjaStarLocation.x, ninjaArray[i].ninjaStarLocation.y);

	}

}
//
viewInstructions()
draw();



