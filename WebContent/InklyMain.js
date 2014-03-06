/*******************************************************************************
 * GAME INITIALIZATION
 ******************************************************************************/
use2D = true;
initGame("myCanvas");

/*
 * these are the inputs for the game, the bools cyan, magenta, yellow, jump, and
 * menu map to 1, 2, 3, space, and escape respectively. In future releases we
 * can choose to make they keys captured from another menu
 */
gInput.addBool(49, "cyan");
gInput.addBool(50, "magenta");
gInput.addBool(51, "yellow");
gInput.addBool(32, "jump");
gInput.addBool(27, "escape");


background = new Sprite;
background.width = 100000; // arbitrarily long number
background.height = 1000;
background.x = 0;
background.y = 0;

palette = new Sprite;
palette.width = 200;
palette.height = 200;
palette.x = canvas.width / 2 - palette.width / 2;
palette.y = 10;
palette.image = Textures.load("0.png");

/*******************************************************************************
 * ARRAYS
 ******************************************************************************/
// array to reference all horizontal platforms
var platforms = new Array();

//array to reference all vertical platforms
var vPlatforms = new Array();

// array to reference all objects that can be collided with
var collidables = new Array();

// array to reference all things that inky can jump on
var jumpables = new Array();

/** ************************************************************************* */
/* GLOBAL VARIABLES */
/** ************************************************************************* */

// variable for the color mode
var colorMode = "none";
var COLOR_MODE_DEFAULT = "none";

// rate at which velocity changes
var gravity = 2;
var GRAVITY_DEFAULT = 2;

// fastest inky can fall
var terminalVelocity = 8;
var TERMINAL_VELOCITY_DEFAULT = 8

// variable for calculating Inky's jump height
var jumpHeight = 15;
var JUMP_HEIGHT_DEFAULT = 15;

// variable for calculating how fast inky jumps (lower is faster)
var jumpSpeed = -16;
var JUMP_SPEED_DEFAULT = -16

// how fast the level moves
var runSpeed = 3;
var RUN_SPEED_DEFAULT = 3;

//used for how long a jump floats in the air 
//TODO: implement hover
var hoverTime = 20;
var HOVER_TIME_DEFAULT = 20;

var currentLevel = "tutorial";

/*******************************************************************************
 * COUNTERS
 ******************************************************************************/

// counter that says how long game has been going
var counter = 0;

var deaths = 0;

//used to count how many cycles death should last for
//TODO: impliment death timer
var deathTimer = 50;
var deathTimerTime = 50

/** ************************************************************************ */
/* MENUS and Manager */
/** ************************************************************************ */

/**
 * this part is where the code to make all screens (menus and such) are here
 * most of this code is copied from the example JS fiddle for screen management
 * and sprite movement: http://jsfiddle.net/Selkcip/BMAam/ and then modified to
 * fit our needs.
 * 
 * For documentation on the functions and objects see:
 * Documentation/Menus_and_Manager.txt
 */

function Screen(alwaysUpdate, alwaysDraw) {
	// sprite constructor called to copy any applicable object properties
	// this also refers to the line after the constructor
	Sprite.call(this);

	this.alwaysUpdate = alwaysUpdate;
	this.alwaysDraw = alwaysDraw;

	this.initialized = false;

	this.Stage = new Sprite();
	this.addChild(this.Stage);

	this.gui = new GUI(gInput);
	this.addChild(this.gui);
}

// This allows the Screen class to inherit all sprite properties
Screen.prototype = new Sprite();

Screen.prototype.init = function() {
};

function ScreenManager() {
	// Call sprite constructor to inherit sprite properties
	Sprite.call(this);

	this.screens = new List();
}
// inherit all sprite properties just like each screen
ScreenManager.prototype = new Sprite();

ScreenManager.prototype.push = function(screen) {
	this.screens.remove(screen);
	this.screens.push(screen);
}

ScreenManager.prototype.pop = function() {
	this.screens.tail.item.gui.visible = false;
	return this.screens.pop();
}

ScreenManager.prototype.remove = function(screen) {
	screen.gui.visible = false;
	this.screens.remove(screen);
}

// Update function for the screen manager
ScreenManager.prototype.update = function(d) {
	// simply an easy reference
	var screens = this.screens;

	for (var node = screens.head; node != null; node = node.link) {
		// makes a reference for easy reference to the node
		var screen = node.item;

		/*
		 * The gui wasn't exactly made for this situation so we need to hide it
		 * if it's not in the current screen. The tail of the screens list is
		 * the current screen.
		 */
		if (node != screens.tail) {
			screen.gui.visible = false;
		} else {
			screen.gui.visible = true;
		}
		if (screen.alwaysUpdate || node == screens.tail) {
			if (!screen.initialized) {
				screen.init();
				screen.initialized = true;
			}
			screen.update(d);
		}
	}
};

ScreenManager.prototype.draw = function(ctx) {
	var screens = this.screens;

	for (var node = screens.head; node != null; node = node.link) {
		var screen = node.item;
		if (screen.alwaysDraw || node == screens.tail) {
			screen.draw(ctx);
		}
	}
};

var screenManager = new ScreenManager();

world.addChild(screenManager);

// creates the main menu screen.

var mainMenu = new Screen(false, false);

mainMenu.image = Textures.load("MainMenu.png");
screenManager.push(mainMenu);

// All buttons and stuff that goes on the main menu go HERE
mainMenu.init = function() {
	/*
	 * since the size of the game is up for debate, the image will be assumed to
	 * be variable.
	 */
	this.width = canvas.width;
	this.height = canvas.height;

	this.gui.x = canvas.width / 2;
	this.gui.y = canvas.height / 2;

	var newGame = new TextButton("New Game");
	newGame.y = 067;
	newGame.center = true;
	newGame.label.dropShadow = true;
	newGame.label.fontSize = 30;
	newGame.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
	this.gui.addChild(newGame);

	newGame.func = function() {
		screenManager.push(gameScreen);
	}

	var resumeGame = new TextButton("Resume Game");
	resumeGame.y = 133;
	resumeGame.center = true;
	resumeGame.label.dropShadow = true;
	resumeGame.label.fontSize = 30;
	resumeGame.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
	this.gui.addChild(resumeGame);

	var credits = new TextButton("Credits");
	credits.y = 197;
	credits.center = true;
	credits.label.dropShadow = true;
	credits.label.fontSize = 30;
	credits.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
	this.gui.addChild(credits);

}

var gameScreen = new Screen(false, true);
gameScreen.image = Textures.load("TempGameScreen.png");

// Override the empty init function to set some properties
gameScreen.init = function() {
	// Since we set a background we want the screen to fill the canvas
	this.width = canvas.width;
	this.height = canvas.height;
	// TODO: put all in game stuff here

	this.Stage.addChild(inky.Sprite);
	this.Stage.addChild(palette)
	this.Stage.addChild(background)
}

var pauseMenu = new Screen(false, true);
// Override the empty init function to set some properties
pauseMenu.init = function() {
	// Since we set a background we want the screen to fill the canvas
	this.width = canvas.width;
	this.height = canvas.height;

	this.gui.x = canvas.width / 2;
	this.gui.y = canvas.height / 2;

	var resumeGame = new TextButton("Resume Game");
	resumeGame.center = true;
	resumeGame.label.dropShadow = true;
	resumeGame.label.fontSize = 30;
	resumeGame.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
	this.gui.addChild(resumeGame);
	resumeGame.func = function() {
		screenManager.remove(pauseMenu);
	}

	var returnToMenu = new TextButton("Main Menu");
	returnToMenu.y = 50;
	returnToMenu.center = true;
	returnToMenu.label.dropShadow = true;
	returnToMenu.label.fontSize = 30;
	returnToMenu.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
	this.gui.addChild(returnToMenu);
	returnToMenu.func = function() {
		screenManager.remove(pauseMenu);
		screenManager.remove(gameScreen);
	}
}

// This makes it so that escape will make the pause screen
gInput.addFunc(27, function() {
	if (screenManager.screens.find(gameScreen)
			&& !screenManager.screens.find(pauseMenu)) {
		screenManager.push(pauseMenu);
		
	}
})

var settingsMenu = new Screen(false, true);

settingsMenu.init = function() {

	this.width = canvas.width;
	this.height = canvas.height;
	this.gui.x = canvas.width / 2;
	this.gui.y = canvas.height / 2;
	// TODO add buttons here
}

/** ************************************************************************ */
/* Definition of objects and Sprites */
/** ************************************************************************ */

// constructor for making inky 
//All variables used to describe current state of play here. If a variable 
//affects how gameplay feels, it belongs in global variables
function inky() {
	// PLACEHOLDER current sprite spawning. Not used here in final version
	inkySprite = new Sprite();
	inkySprite.x = 20;
	inkySprite.y = canvas.height - 200;
	inkySprite.height = 40;
	inkySprite.width = 40;
	// temporary place holder until we get the next image
	inkySprite.image = Textures.load("Inky.png");
	this.Sprite = inkySprite;

	//all temp variables here
	
	/*
	 * int that holds inky's vertical velocity. This is updated each update 
	 * loop and is modified by functions
	 */
	this.velocity = 0;

	/*
	 * integers used to compare inky's previous location with its current one
	 * useful for collision detection
	 */
	previousX = inkySprite.x;
	previousY = inkySprite.y;
	
	//true if inky is in free fall
	this.falling = true;
	
	//true if inky is jumping upwards
	this.jumping = false;
	
	//true if inky is at the height of a jump
	this.hovering = false;
	
	//true if inky is touching something that doesn't kill it
	this.colliding = false;
	
	//the platform inky is colliding with
	this.platform = undefined;
	
	//the collidable inky is colliding with
	this.collidable = undefined
	
	//used to calculate when inky started its last jump
	this.jumpStart = 0;
	
	//previous velocity
	this.previousVelocity = 0;
	
	//how much time inky has hovered
	this.hoverTime = 0;
	
	//true if inky is currently dead;
	this.dead = false;
}

// create inky
inky = new inky();

// update function for inky. All inky behavior defined here
inky.Sprite.update = function(d) {
	
	inky.previousVelocity = inky.velocity; 
	
	if (platformCollide() || jumpCollide())
		inky.colliding = true;
	else inky.colliding = false;

	// This is for falling appropriate code goes here
	if (inky.velocity < terminalVelocity && !inky.hovering) {
		inky.velocity += gravity;
	}
	
	
	// inky jumping
	if (gInput.jump) {
		if (!inky.falling && !inky.colliding && inky.hoverTime < hoverTime){
			inky.hovering = true;
			console.log("hovering!")
		}
		
		if (inky.hovering){
			inky.velocity = 0;
			inky.hoverTime++;
			
			if (inky.hoverTime >= hoverTime){
				inky.hovering = false;
				inky.falling = true;
				inky.velocity += gravity;
				console.log("done hovering!");
			}
		}
		
		if (inky.colliding) {
			if (inky.platform != undefined) {
				if(inky.platform.y >= inky.previousY){
					inky.hoverTime = 0;
					inky.jumpStart = counter;
					inky.velocity = jumpSpeed;
					console.log("boing!");
				}
			}
		}
		
		if (jumpCollide()) {
			if (inky.collidable != undefined) {
				if(inky.collidable.y >= inky.previousY){
					inky.hoverTime = 0;
					inky.jumpStart = counter;
					inky.velocity = jumpSpeed;
					console.log("boing!");
				}
			}
		}
		
		//if inky's has time left to jump then we should set the velocity to jump speed to go up
		if (counter - inky.jumpStart < jumpHeight) {
			inky.velocity = jumpSpeed;
			inky.hoverTime = 0;
			inky.jumping = true;
		}
		
	}
	
	//turn off hovering in case inky is hovering
	inky.hovering = false;
	
	if (gInput.cyan) {
		colorMode = "cyan";
		updatePlatforms();
		palette.image = Textures.load("2.png");
		gameScreen.image = Textures.load("BackgroundC.png");
		console.log("cyan!");
	}
	if (gInput.yellow) {
		colorMode = "yellow";
		updatePlatforms();
		palette.image = Textures.load("3.png");
		gameScreen.image = Textures.load("BackgroundY.png");
		console.log("yellow!");
	}
	if (gInput.magenta) {
		colorMode = "magenta";
		updatePlatforms();
		palette.image = Textures.load("1.png");
		gameScreen.image = Textures.load("BackgroundM.png");
		console.log("magenta!");
	}

	//this is seeing if inky really should fall
	
	if (inky.colliding && !gInput.jump){
		inky.velocity = 0;
		
		if(inky.collidable != undefined){
			console.log ("Inky prev: " + (inky.previousY + inky.Sprite.height)); 
			console.log ("Inky curr: " + (inky.Sprite.y + inky.Sprite.height));
			console.log ("collidable y: " + (inky.collidable.y - inky.previousVelocity));
		}
		
		if(inky.collidable != undefined && inky.previousY + inky.Sprite.height
				<= inky.collidable.y - inky.previousVelocity){
			inky.Sprite.y = inky.collidable.y - inky.height;
		}
		
		if (inky.platform != undefined){
			console.log("inky prev: " + (inky.previousY + inky.Sprite.height));
			console.log ("Inky curr: " + (inky.Sprite.y + inky.Sprite.height));
			console.log("platform y: " + (inky.platform.y - inky.previousVelocity));
		}
		if (inky.platform != undefined && inky.previousY + inky.Sprite.height
				<= inky.platform.y - inky.previousVelocity){
			inky.Sprite.y = inky.platform.y - inky.height;
		}
	}
	/*
	for (var i = 0; i < platforms.length; i++) {
		if (spriteCollide(platforms[i].sprite) && !gInput.jump
				&& platforms[i].tangible) {
			inky.velocity = 0;
		}
	}
	for (var i = 0; i < jumpables.length; i++) {
		if (spriteCollide(jumpables[i].sprite) && !gInput.jump)
			inky.velocity = 0;
	}*/

	// this changes inky's location finally
	this.y += inky.velocity;
	if (!inky.dead)
		background.x -= runSpeed;
	
	//Update variables here for next cycle
	if (inky.previousY < inky.Sprite.y) {
		inky.falling = true;
		inky.jumping = false;
	}else inky.falling = false;

	if (this.y >= canvas.height)
		death();

	vPlatformCollide();
	
	inky.previousX = inky.Sprite.x;
	inky.previousY = inky.Sprite.y;
	
	if (inky.dead)
		death();
	
	tick();
}

function platform(x, y, color) {
	/*
	 * generates sprite and returns object sprite has left, right,
	 */
	this.tangible = true;
	this.color = color;
	this.x = x;
	this.y = y;

	platSprite = new Sprite
	platSprite.x = x;
	platSprite.y = y;
	platSprite.height = 30;
	platSprite.width = 100;

	// TODO: placeholder texture, needs an update and a black one
	if (color == "cyan")
		platSprite.image = Textures.load("PlatformC.png");
	if (color == "magenta")
		platSprite.image = Textures.load("PlatformM.png");
	if (color == "yellow")
		platSprite.image = Textures.load("PlatformY.png");
	if (color == "black")
		platSprite.image = Textures.load("PlatformB.gif");

	this.sprite = platSprite;

	background.addChild(platSprite);

	platforms.push(this);
	collidables.push(this);

}

// TODO: read code for vertical
function platformV(x, y, color) {
	/*
	 * generates sprite and returns object sprite has left, right,
	 */
	this.tangible = true;
	this.color = color;
	this.x = x;
	this.y = y;

	platVSprite = new Sprite
	platVSprite.x = x;
	platVSprite.y = y;
	platVSprite.height = 100;
	platVSprite.width = 30;

	// vertical
	if (color == "cyan")
		platVSprite.image = Textures.load("DeathWallC.png");
	if (color == "magenta")
		platVSprite.image = Textures.load("DeathWallM.png");
	if (color == "yellow")
		platVSprite.image = Textures.load("DeathWallY.png");
	if (color == "black")
		platVSprite.image = Textures.load("DeathWallB.png");
	if (color == "dotV")
		platVSprite.image = Textures.load("PlatformDOTV.png");

	this.sprite = platVSprite;

	background.addChild(platVSprite);

	vPlatforms.push(this);
	collidables.push(this);

}

function floor(start, end) {

	this.start = start;
	this.end = end;

	floorSprite = new Sprite;
	floorSprite.x = start;
	floorSprite.y = canvas.height - 30;
	floorSprite.height = 30;
	floorSprite.width = (end - start);
	floorSprite.image = Textures.load("PlatformB.gif");

	this.sprite = floorSprite;

	background.addChild(floorSprite);

	collidables.push(this);
	jumpables.push(this);

}

platform.update = function(d) {
	// spriteCollide(this.sprite);
}
/** ************************************************************************ */
/* Helper functions */
/** ************************************************************************ */

function tick() {
	counter += 1;
}

// gets the x value of a sprite relative to the Stage
function getX(sprite) {
	return sprite.x + background.x;
}

// gets the y value of a sprite relative to the stage
function getY(sprite) {
	return sprite.y + background.y;
}

// updates all the platfroms with the appropriate colors
function updatePlatforms() {
	for (var i = 0; i < platforms.length; i++) {
		if (colorMode == platforms[i].color) {
			platforms[i].tangible = false;
			// TODO: change texture
		} else {
			platforms[i].tangible = true;
		}
	}
	for (var i = 0; i < vPlatforms.length; i++){
		if (colorMode == vPlatforms[i].color){
			vPlatforms[i].tangible = false;
		} else{
			vPlatforms[i].tangible = true;
		}
	}

}

// returns true if Inky is colliding with a sprite, false if it's not
function spriteCollide(sprite) {

	var inkyLeft = inky.Sprite.x;
	var inkyRight = inky.Sprite.x + inky.Sprite.width;
	var inkyTop = inky.Sprite.y;
	var inkyBottom = inky.Sprite.y + inky.Sprite.height;

	var spriteLeft = getX(sprite);
	var spriteRight = getX(sprite) + sprite.width;
	var spriteTop = getY(sprite);
	var spriteBottom = getY(sprite) + sprite.height;

	// true if inky's left is in the same x coordinates as the sprite
	var leftCollide;
	if (inkyLeft >= spriteLeft && inkyLeft <= spriteRight) {
		leftCollide = true;
	} else
		leftCollide = false;

	// true if inky's right is in the same x coordinates as the sprite
	var rightCollide;
	if (inkyRight >= spriteLeft && inkyRight <= spriteRight) {
		rightCollide = true;
	} else
		rightCollide = false;

	// true if inky's bottom is in the same y coordinates as the sprite
	var bottomCollide;
	if (inkyBottom >= spriteTop && inkyBottom <= spriteBottom) {
		bottomCollide = true;
	} else
		bottomCollide = false;

	// true if inky's top is in the same y coordinates as the sprite
	var topCollide
	if (inkyTop >= spriteTop && inkyTop <= spriteBottom) {
		topCollide = true;
	} else
		topCollide = false;

	if (rightCollide && bottomCollide) {
		return true;
	}

	if (leftCollide && bottomCollide) {
		return true;
	}

	if (rightCollide && topCollide) {
		return true;
	}

	if (leftCollide && topCollide) {
		return true;
	}
	return false;
}

/*
 * returns true if inky is colliding with a tangible platform, false if it's not
 */
function platformCollide() {
	for (var i = 0; i < platforms.length; i++) {
		if (spriteCollide(platforms[i].sprite) && platforms[i].tangible) {
			inky.colliding = true;
			inky.platform = platforms[i].sprite;
			return true;
		}
	}
	inky.platform = undefined;
	return false;
}

//returns the sprite of the platform inky is colliding with
//only use if inky IS collidng with something
function whichPlatform(){
	for (var i = 0; i < platforms.length; i++) {
		if (spriteCollide(platforms[i].sprite) && platforms[i].tangible) {
			return platforms[i].sprite;
		}
	}
	return false;
}

/*
 * returns true if inky is colliding with an object it can jump on that is not a
 * platform also sets the reference in inky to the sprite that it's colliding with
 */
function jumpCollide() {
	for (var i = 0; i < jumpables.length; i++) {
		if (spriteCollide(jumpables[i].sprite)) {
			inky.colliding = true;
			inky.collidable = jumpables[i].sprite;
			return true;
		}
	}
	inky.collidable = undefined;
	return false;
}

//returns the sprite inky is colliding with.
function whichCollide(){
	for (var i = 0; i < jumpables.length; i++) {
		if (spriteCollide(jumpables[i].sprite)) {
			inky.colliding = true;
			return jumpables[i].sprite
		}
	}
	return false;
}

function vPlatformCollide(){
	for (var i = 0; i < vPlatforms.length; i++){
		if (spriteCollide(vPlatforms[i].sprite) && vPlatforms[i].tangible){
			death();
		}
	}
}

// clears all sprites from the level and frees the arrays that reference them
function clearLevel() {
	for (var i = 0; i < collidables.length; i++) {
		collidables[i].sprite.visible = false;
		collidables[i].sprite.x = 0;
		collidables[i].sprite.y = 0;
		collidables.pop();
	}
	for (var i = 0; i < platforms.length; i++) {
		platforms.pop();
	}
	for (var i = 0; i < jumpables.length; i++) {
		jumpables.pop();
	}
	for (var i = 0; i < vPlatforms.length; i++){
		vPlatforms.pop();
	}
}

// TODO complete function
function death() {
	inky.dead = true;
	deathTimerTime++;
	
	if (deathTimerTime >= deathTimer){
		inky.Sprite.y = canvas.height - 200;
		inky.velocity = 0;
		background.x = 0;
		deaths += 1;
		inky.dead = false;
	}
}


/*
var level1 = {
	"platforms" : [ {
		"x" : 0,
		"y" : 550,
		"color" : "black"
	}, {
		"x" : 550,
		"y" : 350,
		"color" : "black"
	}, {
		"x" : 700,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 800,
		"y" : 350,
		"color" : "black"
	}, {
		"x" : 950,
		"y" : 250,
		"color" : "cyan"
	}, {
		"x" : 1100,
		"y" : 350,
		"color" : "black"
	}, {
		"x" : 1200,
		"y" : 450,
		"color" : "magenta"
	}, {
		"x" : 1300,
		"y" : 250,
		"color" : "yellow"
	}, {
		"x" : 1400,
		"y" : 150,
		"color" : "magenta"
	}, {
		"x" : 1600,
		"y" : 450,
		"color" : "cyan"
	}, {
		"x" : 1750,
		"y" : 250,
		"color" : "cyan"
	}, {
		"x" : 1880,
		"y" : 150,
		"color" : "yellow"
	}, {
		"x" : 2100,
		"y" : 450,
		"color" : "magenta"
	}, {
		"x" : 2200,
		"y" : 150,
		"color" : "black"
	}, {
		"x" : 2200,
		"y" : 200,
		"color" : "black"
	}, {
		"x" : 2200,
		"y" : 450,
		"color" : "magenta"
	}, {
		"x" : 2300,
		"y" : 350,
		"color" : "yellow"
	}, {
		"x" : 2420,
		"y" : 350,
		"color" : "yellow"
	}, {
		"x" : 2500,
		"y" : 450,
		"color" : "magenta"
	}, {
		"x" : 2600,
		"y" : 250,
		"color" : "magenta"
	}, {
		"x" : 2700,
		"y" : 400,
		"color" : "yellow"
	}, {
		"x" : 2800,
		"y" : 300,
		"color" : "yellow"
	}, {
		"x" : 2900,
		"y" : 300,
		"color" : "cyan"
	}, {
		"x" : 3000,
		"y" : 200,
		"color" : "cyan"
	}, {
		"x" : 3200,
		"y" : 450,
		"color" : "magenta"
	}, {
		"x" : 3300,
		"y" : 450,
		"color" : "yellow"
	}, {
		"x" : 3400,
		"y" : 200,
		"color" : "magenta"
	}, {
		"x" : 3600,
		"y" : 450,
		"color" : "cyan"
	}, {
		"x" : 3700,
		"y" : 400,
		"color" : "cyan"
	}, {
		"x" : 3800,
		"y" : 400,
		"color" : "magenta"
	}, {
		"x" : 3900,
		"y" : 400,
		"color" : "yellow"
	}, {
		"x" : 4000,
		"y" : 400,
		"color" : "cyan"
	}, {
		"x" : 4100,
		"y" : 400,
		"color" : "yellow"
	}, {
		"x" : 4200,
		"y" : 350,
		"color" : "cyan"
	}, {
		"x" : 4300,
		"y" : 250,
		"color" : "magenta"
	}, {
		"x" : 4500,
		"y" : 450,
		"color" : "yellow"
	}, {
		"x" : 4600,
		"y" : 400,
		"color" : "cyan"
	}, {
		"x" : 4700,
		"y" : 200,
		"color" : "yellow"
	}, {
		"x" : 4800,
		"y" : 100,
		"color" : "cyan"
	}, {
		"x" : 5000,
		"y" : 400,
		"color" : "magenta"
	}, {
		"x" : 5100,
		"y" : 300,
		"color" : "yellow"
	}, {
		"x" : 5200,
		"y" : 100,
		"color" : "cyan"
	}, {
		"x" : 5400,
		"y" : 450,
		"color" : "yellow"
	}, {
		"x" : 5500,
		"y" : 300,
		"color" : "cyan"
	}, {
		"x" : 5600,
		"y" : 450,
		"color" : "magenta"
	}, {
		"x" : 5700,
		"y" : 100,
		"color" : "cyan"
	}, {
		"x" : 5900,
		"y" : 400,
		"color" : "yellow"
	}, {
		"x" : 6000,
		"y" : 220,
		"color" : "magenta"
	}, {
		"x" : 6100,
		"y" : 300,
		"color" : "cyan"
	}, {
		"x" : 6250,
		"y" : 200,
		"color" : "yellow"
	}, {
		"x" : 6380,
		"y" : 100,
		"color" : "magenta"
	}, {
		"x" : 6550,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 6600,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 6650,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 6700,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 6750,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 6800,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 6850,
		"y" : 450,
		"color" : "black"
	} ]
}

var level2 = {
	"platforms" : [ {
		"x" : 450,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 550,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 650,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 700,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 900,
		"y" : 400,
		"color" : "black"
	}, {
		"x" : 1000,
		"y" : 450,
		"color" : "magenta"
	}, {
		"x" : 1100,
		"y" : 350,
		"color" : "yellow"
	}, {
		"x" : 1250,
		"y" : 350,
		"color" : "yellow"
	}, {
		"x" : 1400,
		"y" : 450,
		"color" : "cyan"
	}, {
		"x" : 1500,
		"y" : 250,
		"color" : "magenta"
	}, {
		"x" : 1600,
		"y" : 250,
		"color" : "magenta"
	}, {
		"x" : 1700,
		"y" : 250,
		"color" : "magenta"
	}, {
		"x" : 1850,
		"y" : 250,
		"color" : "cyan"
	}, {
		"x" : 1900,
		"y" : 350,
		"color" : "black"
	}, {
		"x" : 2050,
		"y" : 400,
		"color" : "magenta"
	}, {
		"x" : 2150,
		"y" : 200,
		"color" : "yellow"
	}, {
		"x" : 2200,
		"y" : 300,
		"color" : "magenta"
	}, {
		"x" : 2300,
		"y" : 250,
		"color" : "cyan"
	}, {
		"x" : 2550,
		"y" : 200,
		"color" : "cyan"
	}, {
		"x" : 2700,
		"y" : 450,
		"color" : "yellow"
	}, {
		"x" : 2800,
		"y" : 300,
		"color" : "yellow"
	}, {
		"x" : 2950,
		"y" : 400,
		"color" : "cyan"
	}, {
		"x" : 3050,
		"y" : 200,
		"color" : "magenta"
	}, {
		"x" : 3200,
		"y" : 450,
		"color" : "yellow"
	}, {
		"x" : 3300,
		"y" : 450,
		"color" : "yellow"
	}, {
		"x" : 3300,
		"y" : 200,
		"color" : "magenta"
	}, {
		"x" : 3400,
		"y" : 450,
		"color" : "cyan"
	}, {
		"x" : 3400,
		"y" : 150,
		"color" : "cyan"
	}, {
		"x" : 3500,
		"y" : 400,
		"color" : "magenta"
	}, {
		"x" : 3500,
		"y" : 200,
		"color" : "yellow"
	}, {
		"x" : 3700,
		"y" : 400,
		"color" : "magenta"
	}, {
		"x" : 3800,
		"y" : 450,
		"color" : "cyan"
	}, {
		"x" : 3850,
		"y" : 350,
		"color" : "cyan"
	}, {
		"x" : 4000,
		"y" : 250,
		"color" : "magenta"
	}, {
		"x" : 4170,
		"y" : 450,
		"color" : "yellow"
	}, {
		"x" : 4300,
		"y" : 400,
		"color" : "cyan"
	}, {
		"x" : 4400,
		"y" : 200,
		"color" : "yellow"
	}, {
		"x" : 4550,
		"y" : 250,
		"color" : "cyan"
	}, {
		"x" : 4650,
		"y" : 350,
		"color" : "magenta"
	}, {
		"x" : 4800,
		"y" : 400,
		"color" : "cyan"
	}, {
		"x" : 4900,
		"y" : 250,
		"color" : "cyan"
	}, {
		"x" : 5050,
		"y" : 400,
		"color" : "yellow"
	}, {
		"x" : 5200,
		"y" : 300,
		"color" : "cyan"
	}, {
		"x" : 5350,
		"y" : 450,
		"color" : "magenta"
	}, {
		"x" : 5500,
		"y" : 100,
		"color" : "cyan"
	}, {
		"x" : 5650,
		"y" : 300,
		"color" : "yellow"
	}, {
		"x" : 5750,
		"y" : 400,
		"color" : "yellow"
	}, {
		"x" : 5850,
		"y" : 220,
		"color" : "magenta"
	}, {
		"x" : 6000,
		"y" : 350,
		"color" : "cyan"
	}, {
		"x" : 6150,
		"y" : 200,
		"color" : "yellow"
	}, {
		"x" : 6250,
		"y" : 150,
		"color" : "magenta"
	}, {
		"x" : 6350,
		"y" : 250,
		"color" : "cyan"
	}, {
		"x" : 6450,
		"y" : 450,
		"color" : "magenta"
	}, {
		"x" : 6550,
		"y" : 450,
		"color" : "yellow"
	}, {
		"x" : 6650,
		"y" : 450,
		"color" : "cyan"
	}, {
		"x" : 6700,
		"y" : 250,
		"color" : "yellow"
	}, {
		"x" : 6850,
		"y" : 350,
		"color" : "magenta"
	}, {
		"x" : 7050,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 7150,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 7250,
		"y" : 450,
		"color" : "black"
	}, {
		"x" : 7350,
		"y" : 450,
		"color" : "black"
	} ]
}

// "black" did not work. Changed to .gif.
var level2V = {
	"platformVs" : [
	// First death wall is for training the player
	{
		"x" : 800,
		"y" : 0,
		"color" : "magenta"
	},
	// Begin jumps
	{
		"x" : 1200,
		"y" : 0,
		"color" : "cyan"
	}, {
		"x" : 1700,
		"y" : 0,
		"color" : "yellow"
	}, {
		"x" : 2400,
		"y" : 0,
		"color" : "magenta"
	}, {
		"x" : 3600,
		"y" : 200,
		"color" : "magenta"
	}, {
		"x" : 5150,
		"y" : 0,
		"color" : "yellow"
	}, {
		"x" : 5450,
		"y" : 0,
		"color" : "cyan"
	}, {
		"x" : 5950,
		"y" : 0,
		"color" : "magenta"
	}, {
		"x" : 6600,
		"y" : 0,
		"color" : "cyan"
	}, {
		"x" : 6800,
		"y" : 0,
		"color" : "magenta"
	}, {
		"x" : 7000,
		"y" : 0,
		"color" : "yellow"
	},
	// Rest of platforms placed after level ends.
	// Loop will stop drawing entirely when either number of platforms or walls
	// expires.
	{
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, {
		"x" : 8000,
		"y" : 0,
		"color" : "black"
	}, ]
}

new floor(0, 500);
/*
 * if (level1Flag){ // The '80' is some arbitrary value I picked. Make sure it's
 * higher than the number of platforms. for (var i = 0; i < 80; i++) { new
 * platform(level1.platforms[i].x, level1.platforms[i].y,
 * level1.platforms[i].color); // No level1V exists. Create one if necessary.
 * new platformV(level1V.platformVs[i].x, level1V.platformVs[i].y,
 * level1V.platformVs[i].color); } }
 */
/*
// if (level2Flag) {
for (var i = 0; i < 80; i++) {
	new platform(level2.platforms[i].x, level2.platforms[i].y,
			level2.platforms[i].color);
	new platformV(level2V.platformVs[i].x, level2V.platformVs[i].y,
			level2V.platformVs[i].color);
}
// }
*/

new platformV(500, 200, "cyan");
new floor(0, 500);
new platform(550, 350, "black");
new platform(700, 450, "black");
new platform(800, 350, "black");
new platform(950, 250, "cyan");
new platform(1100, 350, "black");
new platform(1200, 450, "magenta");
new platform(1300, 250, "yellow");
new platform(1400, 150, "magenta");
new platform(1600, 450, "cyan");

new platform(1750, 250, "cyan");
new platform(1880, 150, "yellow");
new platform(2100, 450, "magenta");
new platform(2200, 150, "black");
new platform(2200, 200, "black");
new platform(2200, 450, "magenta");
new platform(2300, 350, "cyan");
new platform(2420, 350, "yellow");
new platform(2500, 450, "magenta");
new platform(2600, 250, "magenta");
new platform(2700, 400, "yellow");
new platform(2800, 300, "yellow");
new platform(2900, 300, "cyan");
new platform(3000, 200, "cyan");
new platform(3200, 450, "magenta");
new platform(3300, 450, "yellow");
new platform(3400, 200, "magenta");
new platform(3600, 450, "cyan");
new platform(3700, 400, "cyan");
new platform(3800, 400, "magenta");
new platform(3900, 400, "yellow");
new platform(4000, 400, "cyan");
new platform(4100, 400, "yellow");
new platform(4200, 350, "cyan");
new platform(4300, 250, "magenta");
new platform(4500, 450, "yellow");
new platform(4600, 400, "cyan");
new platform(4700, 200, "yellow");
new platform(4800, 100, "cyan");
new platform(5000, 400, "magenta");
new platform(5100, 300, "yellow");
new platform(5200, 100, "cyan");
new platform(5400, 450, "yellow");
new platform(5500, 300, "cyan");
new platform(5600, 450, "magenta");
new platform(5700, 100, "cyan");
new platform(5900, 400, "yellow");
new platform(6000, 220, "magenta");
new platform(6100, 300, "cyan");
new platform(6250, 200, "yellow");
new platform(6380, 100, "magenta");
new platform(6550, 450, "black");
new platform(6550, 450, "black");
new platform(6600, 450, "black");
new platform(6650, 450, "black");
new platform(6700, 450, "black");
new platform(6750, 450, "black");
new platform(6800, 450, "black");
new platform(6850, 450, "black");