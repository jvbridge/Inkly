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

// 1 does cyan
gInput.addBool(49, "cyan");

// 2 does magenta
gInput.addBool(50, "magenta");

// 3 does yellow
gInput.addBool(51, "yellow");

// space does jump
gInput.addBool(32, "jump");

// escape does menu
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

/*
 * ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * LOAD MUSIC/SOUNDS
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 */

var theme = new Audio("mainsong.mp3");

theme.addEventListener('ended', function() {
	this.currentTime = 0;
	this.play();
}, false);

var menuTheme = new Audio("menu.mp3");

menuTheme.addEventListener('ended', function() {
	this.currentTime = 0;
	this.play();
}, false);

var fallDeath = new Audio("splat3.mp3");

var wallDeath = new Audio("splat2.wav");

var sound1 = new Audio("SOUND1.mp3");

var sound2 = new Audio("SOUND2.mp3");

var sound3 = new Audio("SOUND3.mp3");

/*******************************************************************************
 * ARRAYS
 ******************************************************************************/
// array to reference all horizontal platforms
var platforms = new Array();

// array to reference all vertical platforms
var vPlatforms = new Array();

// array to reference all objects that can be collided with
var collidables = new Array();

// array to reference all things that inky can jump on
var jumpables = new Array();

// an array of all level objects
var levels = new Array();

/** ************************************************************************* */
/* GLOBAL VARIABLES */
/** ************************************************************************* */

// reference to game's current level
var currentlevel = undefined;

// Which level you're currently on
var currentLevelNumber = 1;

// variable for the color mode
var colorMode = "none";
var COLOR_MODE_DEFAULT = "none";

// rate at which velocity changes
var gravity = 3;
var GRAVITY_DEFAULT = 2;

// fastest inky can fall
var terminalVelocity = 13;
var TERMINAL_VELOCITY_DEFAULT = 8;

// variable for calculating Inky's jump height
var jumpHeight = 15;
var JUMP_HEIGHT_DEFAULT = 15;

// variable for calculating how fast inky jumps (lower is faster)
var jumpSpeed = -16;
var JUMP_SPEED_DEFAULT = -16

// how fast the level moves
var runSpeed = 5;
var RUN_SPEED_DEFAULT = 5;

// used for how long a jump floats in the air
var hoverTime = 15;
var HOVER_TIME_DEFAULT = 15;

var mute = false;

var inGame = false;

/*******************************************************************************
 * COUNTERS
 ******************************************************************************/

// counter that says how long game has been going
var counter = 0;

var deaths = 0;

var totalDeaths = 0;

// used to count how many cycles death should last for
var deathTimer = 100;

var deathTimerTime = 0;

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

	menuTheme.play();
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
		currentLevelNumber = 1;
		menuTheme.pause();
		menuTheme.currentTime = 0;
		theme.currentTime = 0;
		if (!mute)
			theme.play();
		currentLevel = levels[0];
		background.x = 0;
		inky.Sprite.y = canvas.height - 200;
		buildLevel();
		deaths = 0;
		totalDeaths = 0;
		inGame = true;
		setRandomColor();
		screenManager.push(gameScreen);
	}

	var resumeGame = new TextButton("Resume Game");
	resumeGame.y = 133;
	resumeGame.center = true;
	resumeGame.label.dropShadow = true;
	resumeGame.label.fontSize = 30;
	resumeGame.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
	this.gui.addChild(resumeGame);

	resumeGame.func = function() {
		if (inGame) {
			menuTheme.pause();
			menuTheme.currentTime = 0;
			theme.currentTime = 0;
			if (!mute)
				theme.play();
			screenManager.push(gameScreen);
		}
	}

	var credits = new TextButton("Credits");
	credits.y = 197;
	credits.center = true;
	credits.label.dropShadow = true;
	credits.label.fontSize = 30;
	credits.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
	this.gui.addChild(credits);

	credits.func = function() {
		screenManager.push(creditsScreen);
	}
}

var gameScreen = new Screen(false, true);

// Override the empty init function to set some properties
gameScreen.init = function() {
	// Since we set a background we want the screen to fill the canvas
	this.width = canvas.width;
	this.height = canvas.height;
	this.Stage.addChild(inky.Sprite);
	this.Stage.addChild(palette);
	this.Stage.addChild(background);
	menuTheme.pause();
	if (!mute)
		theme.play();
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
		theme.pause();
		theme.currentTime = 0;
		menuTheme.currentTime = 0;
		if (!mute)
			menuTheme.play();
		screenManager.remove(pauseMenu);
		screenManager.remove(gameScreen);
	}

	var muteButton = new TextButton("Mute");
	muteButton.y = 100;
	muteButton.center = true;
	muteButton.label.dropShadow = true;
	muteButton.label.fontSize = 30;
	muteButton.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
	this.gui.addChild(muteButton);
	muteButton.func = function() {
		if (mute) {
			mute = false;
			theme.play();
		} else {
			mute = true;
			theme.pause();
		}
	}
}

levelSummary = new Screen(false, true);

levelSummary.init = function() {
	this.width = canvas.width;
	this.height = canvas.height;
	this.gui.x = -1 * canvas.width / 2;
	this.gui.y = -1 * canvas.height / 2;

	continueFunc = function() {
		if (currentLevelNumber < 6)
			screenManager.push(gameScreen);
		else {
			inGame = false;
			theme.currentTime = 0;
			theme.pause();
			menuTheme.currentTime = 0;
			menuTheme.play();
			levelSummary.image = Textures.load("BackgroundW.png");
			screenManager.push(mainMenu);
		}
	}

	var continueGame = new Button(continueFunc);
	continueGame.y = 0;
	continueGame.x = 0;
	continueGame.height = canvas.height;
	continueGame.width = canvas.width;
	this.gui.addChild(continueGame);

	// Does not work!
	this.inkWasted = new TextBox("Ink Wasted");
	this.inkWasted.x = 50;
	this.inkWasted.y = 350;
	this.inkWasted.fontSize = 30;
	this.inkWasted.bgColor = ("#000000");
	this.inkWasted.bgFocusColor = ("#ffffff");
	this.inkWasted.visible = true;
	this.gui.addChild(this.inkWasted);

	this.deathReport = new TextBox("Death Report");

	// TODO add sounds for end level
}

// This makes it so that escape will make the pause screen
gInput.addFunc(27, function() {
	if (screenManager.screens.find(gameScreen)
			&& !screenManager.screens.find(pauseMenu)) {
		screenManager.push(pauseMenu);
	}
})
// not used
var settingsMenu = new Screen(false, true);

settingsMenu.init = function() {

	this.width = canvas.width;
	this.height = canvas.height;
	this.gui.x = canvas.width / 2;
	this.gui.y = canvas.height / 2;
	// TODO add buttons here
}

var creditsScreen = new Screen(false, false);

creditsScreen.init = function() {
	this.width = canvas.width;
	this.height = canvas.height;
	this.gui.x = canvas.width / 2;
	this.gui.y = canvas.height / 2;
	this.image = Textures.load("Credits.png");

	returnFunction = function() {
		screenManager.remove(creditsScreen);
	}

	var returnMenu = new Button(returnFunction);
	returnMenu.y = -1 * canvas.height / 2;
	returnMenu.x = -1 * canvas.width / 2;
	returnMenu.height = canvas.height;
	returnMenu.width = canvas.width;
	this.gui.addChild(returnMenu);
}

/** ************************************************************************ */
/* Definition of objects and Sprites */
/** ************************************************************************ */

// constructor for making inky
// All variables used to describe current state of play here. If a variable
// affects how gameplay feels, it belongs in global variables
function inky() {
	// PLACEHOLDER current sprite spawning. Not used here in final version
	inkySprite = new Sprite();
	inkySprite.x = 145;
	inkySprite.y = canvas.height - 200;
	inkySprite.height = 40;
	inkySprite.width = 40;
	// temporary place holder until we get the next image
	inkySprite.image = Textures.load("running-25.png");
	inkySprite.frameWidth = 280;
	inkySprite.frameHeight = 350;
	inkySprite.frameCount = 18;

	this.Sprite = inkySprite;

	// all temp variables here

	/*
	 * int that holds inky's vertical velocity. This is updated each update loop
	 * and is modified by functions
	 */
	this.velocity = 0;

	/*
	 * integers used to compare inky's previous location with its current one
	 * useful for collision detection
	 */
	previousX = inkySprite.x;
	previousY = inkySprite.y;

	// true if inky is in free fall
	this.falling = true;

	// true if inky is jumping upwards
	this.jumping = false;

	// true if inky is at the height of a jump
	this.hovering = false;

	// true if inky is touching something that doesn't kill it
	this.colliding = false;

	// the platform inky is colliding with
	this.platform = undefined;

	// the collidable inky is colliding with
	this.collidable = undefined

	// used to calculate when inky started its last jump
	this.jumpStart = 0;

	this.jumped = true;

	// previous velocity
	this.previousVelocity = 0;

	// how much time inky has hovered
	this.hoverTime = 0;

	// true if inky is currently dead;
	this.dead = false;
}

// create inky
inky = new inky();

// update function for inky. All inky behavior defined here
inky.Sprite.update = function(d) {

	if (inky.previousX != inky.Sprite.x) {
		console.log("bug");
	}

	inky.previousVelocity = inky.velocity;

	if (platformCollide() || jumpCollide())
		inky.colliding = true;
	else
		inky.colliding = false;

	// This is for falling appropriate code goes here
	if (inky.velocity < terminalVelocity && !inky.hovering) {
		inky.velocity += gravity;
	}

	// inky jumping
	if (gInput.jump) {
		if (!inky.falling && !inky.colliding && inky.hoverTime < hoverTime) {
			inky.hovering = true;
			console.log("hovering!")
			inky.Sprite.image = Textures.load("JUMPING25.png")
			inky.Sprite.frameWidth = 284;
			inky.Sprite.frameHeight = 350;
			inky.Sprite.frameCount = 1;
		}

		if (inky.hovering) {
			inky.velocity = 0;
			inky.hoverTime++;
			inky.Sprite.image = Textures.load("JUMPING25.png")
			inky.Sprite.frameWidth = 284;
			inky.Sprite.frameHeight = 350;
			inky.Sprite.frameCount = 1;

			if (inky.hoverTime >= hoverTime) {
				inky.hovering = false;
				inky.falling = true;
				inky.velocity += gravity;
				console.log("done hovering!");
			}
		}

		if (inky.colliding) {
			if (inky.platform != undefined) {
				if (inky.platform.y >= inky.previousY) {
					inky.hoverTime = 0;
					inky.jumpStart = counter;
					inky.velocity = jumpSpeed;
					console.log("boing!");
				}
			}
		}

		if (inky.colliding) {
			if (inky.collidable != undefined) {
				if (inky.collidable.y >= inky.previousY) {
					inky.hoverTime = 0;
					inky.jumpStart = counter;
					inky.velocity = jumpSpeed;
					console.log("boing!");
				}
			}
		}

		// if inky's has time left to jump then we should set the velocity to
		// jump speed to go up
		if (counter - inky.jumpStart < jumpHeight) {
			inky.velocity = jumpSpeed;
			inky.hoverTime = 0;
			inky.jumping = true;
		}

	}

	// turn off hovering in case inky is hovering
	inky.hovering = false;

	if (gInput.cyan) {
		colorMode = "cyan";
		updatePlatforms();
		palette.image = Textures.load("2.png");
		gameScreen.image = Textures.load("BackgroundC.png");
		if (!mute)
			sound1.play();
		console.log("cyan!");
	}
	if (gInput.yellow) {
		colorMode = "yellow";
		updatePlatforms();
		palette.image = Textures.load("3.png");
		gameScreen.image = Textures.load("BackgroundY.png");
		if (!mute)
			sound2.play();
		console.log("yellow!");
	}
	if (gInput.magenta) {
		colorMode = "magenta";
		updatePlatforms();
		palette.image = Textures.load("1.png");
		gameScreen.image = Textures.load("BackgroundM.png");
		if (!mute)
			sound3.play();
		console.log("magenta!");
	}

	// this is seeing if inky really should fall

	if (inky.colliding && !gInput.jump) {
		inky.velocity = 0;

		if (inky.collidable != undefined) {
			// TODO: replace console logs here
		}
		/*
		 * TODO: fix this shitty code if (inky.collidable != undefined &&
		 * inky.previousY + inky.Sprite.height <= inky.collidable.y -
		 * inky.previousVelocity) { inky.Sprite.y = inky.collidable.y -
		 * inky.height; }
		 */

		if (inky.platform != undefined) {
			/*
			 * console.log("inky prev: " + (inky.previousY +
			 * inky.Sprite.height)); console.log ("Inky curr: " + (inky.Sprite.y +
			 * inky.Sprite.height)); console.log("platform y: " +
			 * (inky.platform.y - inky.previousVelocity));
			 */
		}
		/*
		 * if (inky.platform != undefined && inky.previousY + inky.Sprite.height <=
		 * inky.platform.y - inky.previousVelocity){ inky.Sprite.y =
		 * inky.platform.y - inky.height; }
		 */
	}

	if (inky.velocity == 0 && !inky.hovering && !inky.falling) {
		inky.Sprite.image = Textures.load("running-25.png");
		inky.Sprite.frameWidth = 280;
		inky.Sprite.frameHeight = 350;
		inky.Sprite.frameCount = 18;
	}

	// this changes inky's location finally
	this.y += inky.velocity;
	if (!inky.dead)
		background.x -= runSpeed;

	// Update variables here for next cycle
	if (inky.previousY < inky.Sprite.y) {
		inky.falling = true;
		inky.jumping = false;
	} else
		inky.falling = false;

	if (this.y >= canvas.height) {
		if (!mute)
			fallDeath.play();
		death();
	}

	vPlatformCollide();

	inky.previousX = inky.Sprite.x;
	inky.previousY = inky.Sprite.y;

	if (inky.dead)
		death();

	if (spriteCollide(currentLevel.finish)) {
		finish();
		console.log("FINISH!")
	}

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
	platSprite.height = 15;
	platSprite.width = 100;

	// TODO: placeholder texture, needs an update and a black one
	if (color == "cyan")
		platSprite.image = Textures.load("PlatformC.png");
	if (color == "magenta")
		platSprite.image = Textures.load("PlatformM.png");
	if (color == "yellow")
		platSprite.image = Textures.load("PlatformY.png");
	if (color == "black")
		platSprite.image = Textures.load("PlatformB.png");

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
	platVSprite.height = canvas.height;
	platVSprite.width = 30;

	// vertical
	if (color == "cyan")
		platVSprite.image = Textures.load("PlatformCV.png");
	if (color == "magenta")
		platVSprite.image = Textures.load("PlatformMV.png");
	if (color == "yellow")
		platVSprite.image = Textures.load("PlatformYV.png");
	if (color == "black")
		platVSprite.image = Textures.load("PlatformBV.png");
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
	floorSprite.image = Textures.load("PlatformB.png");

	this.sprite = floorSprite;

	background.addChild(floorSprite);

	collidables.push(this);
	jumpables.push(this);

}

platform.update = function(d) {
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
			platforms[i].sprite.image = Textures.load("PlatformDOT.png")
		} else {
			platforms[i].tangible = true;
			if (platforms[i].color == "cyan")
				platforms[i].sprite.image = Textures.load("PlatformC.png");
			if (platforms[i].color == "magenta")
				platforms[i].sprite.image = Textures.load("PlatformM.png");
			if (platforms[i].color == "yellow")
				platforms[i].sprite.image = Textures.load("PlatformY.png");
		}
		if (platforms[i].color == "black")
			platforms[i].sprite.image = Textures.load("PlatformB.png");
	}
	for (var i = 0; i < vPlatforms.length; i++) {
		if (colorMode == vPlatforms[i].color) {
			vPlatforms[i].tangible = false;
			vPlatforms[i].sprite.image = Textures.load("PlatformDOTV.png");
		} else {
			vPlatforms[i].tangible = true;

			if (vPlatforms[i].color == "cyan")
				vPlatforms[i].sprite.image = Textures.load("PlatformCV.png");
			if (vPlatforms[i].color == "magenta")
				vPlatforms[i].sprite.image = Textures.load("PlatformMV.png");
			if (vPlatforms[i].color == "yellow")
				vPlatforms[i].sprite.image = Textures.load("PlatformYV.png");
		}
		if (vPlatforms[i].color == "black")
			vPlatforms[i].sprite.image = Textures.load("PlatformBV.png");
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

/*
 * returns true if inky is colliding with an object it can jump on that is not a
 * platform also sets the reference in inky to the sprite that it's colliding
 * with
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

function vPlatformCollide() {
	for (var i = 0; i < vPlatforms.length; i++) {
		if (spriteCollide(vPlatforms[i].sprite) && vPlatforms[i].tangible) {
			if (!mute)
				wallDeath.play();
			death();
		}
	}
}

function setRandomColor() {
	var colorChoice = Math.floor((Math.random() * 3) + 1);

	if (colorChoice == 1) {
		colorMode = "cyan";
		updatePlatforms();
		palette.image = Textures.load("2.png");
		gameScreen.image = Textures.load("BackgroundC.png");
		if (!mute)
			sound1.play();
	}
	if (colorChoice == 2) {
		colorMode = "yellow";
		updatePlatforms();
		palette.image = Textures.load("3.png");
		gameScreen.image = Textures.load("BackgroundY.png");
		if (!mute)
			sound2.play();
	}
	if (colorChoice == 3) {
		colorMode = "magenta";
		updatePlatforms();
		palette.image = Textures.load("1.png");
		gameScreen.image = Textures.load("BackgroundM.png");
		if (!mute)
			sound3.play();
	}

}

// clears all sprites from the level and frees the arrays that reference them
function clearLevel() {
	console.log("clearing level!")
	for (var i = 0; i < collidables.length; i++) {
		collidables[i].sprite.visible = false;
		collidables[i].sprite.x = -100;
		collidables[i].sprite.y = -100;
	}
	collidabels = [];
	for (var i = 0; i < platforms.length; i++) {
		platforms[i].tangible = false;
		platforms[i].sprite.visible = false;
		platforms[i].color = "none"
		platforms[i].sprite.x = -100;
		platforms[i].sprite.y = -100;
	}
	platforms = [];
	for (var i = 0; i < jumpables.length; i++) {
		jumpables[i].sprite.x = -100;
		jumpables[i].sprite.y = -100;
		jumpables[i].sprite.visible = false;
	}
	jumpables = [];
	for (var i = 0; i < vPlatforms.length; i++) {
		vPlatforms[i].tangible = false;
		vPlatforms[i].visible = false;
		vPlatforms[i].color = "none"
		vPlatforms[i].sprite.x = -100;
		vPlatforms[i].sprite.y = -100;
	}
	vPlatforms = [];
	currentLevel.finish.visible = false;
	currentLevel.finish.x = -500;
	currentLevel.finish.y = 1000;
}

function death() {

	inky.dead = true;
	deathTimerTime++;
	inky.Sprite.visible = false;

	if (deathTimerTime % 15 == 1) {
		setRandomColor();
	}

	if (deathTimerTime >= deathTimer) {
		console.log("background at: " + background.x);
		// this refreshes the textures on the black platforms and floors
		for (var i = 0; i < platforms.length; i++) {
			if (platforms[i].color == "black") {
				platforms[i].sprite.image = Textures.load("PlatformDOT.png");
				platforms[i].sprite.image = Textures.load("PlatformB.png");
			}
		}
		inky.Sprite.y = canvas.height - 200;
		inky.velocity = 0;
		background.x = 0;
		deaths += 1;
		deathTimerTime = 0;
		inky.Sprite.visible = true;
		inky.dead = false;
	}
}

function finish() {

	if (currentLevelNumber == 1)
		levelSummary.image = Textures.load("LevelEnd1.png");
	if (currentLevelNumber == 2)
		levelSummary.image = Textures.load("LevelEnd2.png");
	if (currentLevelNumber == 3)
		levelSummary.image = Textures.load("LevelEnd3.png");
	if (currentLevelNumber == 4)
		levelSummary.image = Textures.load("LevelEnd4.png");
	if (currentLevelNumber == 5)
		levelSummary.image = Textures.load("LevelEnd5.png");
	if (currentLevelNumber == 6)
		levelSummary.image = Textures.load("GameEnd.png");

	screenManager.push(levelSummary);
	screenManager.remove(gameScreen);
	// levelSummary.gui.addChild(levelSummary.inkWasted);
	if (currentLevelNumber < 6) {
		clearLevel();
		currentLevel = levels[currentLevelNumber];
		currentLevelNumber++;
		background.x = 0;
		buildLevel();
		totalDeaths += deaths;
		death();
		deaths = 0;
	}
}

/*
 * ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * LEVEL HANDLING
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 */

function level(levelNumber, levelLength) {
	this.levelNumber = levelNumber;
	this.levelLength = levelLength;
	this.platforms = [];
	this.vPlatforms = [];
	this.floors = [];
	finishLine = new Sprite;
	finishLine.x = levelLength;
	finishLine.y = 0;
	finishLine.height = canvas.height;
	finishLine.width = 100;
	finishLine.image = Textures.load("FinishLine.png");
	finishLine.visible = true;
	this.finish = finishLine;

	levels.push(this);
}

function buildLevel() {

	console.log("building level!");
	console.log("levelLength: " + currentLevel.levelLength);
	console.log(currentLevel);

	console.log(currentLevel.platforms.length);
	for (i = 0; i < currentLevel.platforms.length; i++) {
		new platform(currentLevel.platforms[i].x, currentLevel.platforms[i].y,
				currentLevel.platforms[i].color);
	}
	for (i = 0; i < currentLevel.vPlatforms.length; i++) {
		new platformV(currentLevel.vPlatforms[i].x,
				currentLevel.vPlatforms[i].y, currentLevel.vPlatforms[i].color);
	}
	for (i = 0; i < currentLevel.floors.length; i++) {
		new floor(currentLevel.floors[i].start, currentLevel.floors[i].end);
	}

	deathWall = new platformV(550, 0, "cyan");
	deathWall.sprite.height = canvas.height;

	new floor(0, 500);
	background.addChild(currentLevel.finish);
}

function platformPrototype(x, y, color) {
	this.x = x;
	this.y = y;
	this.color = color;
}

/**
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * where levels are actually defined (start with first one for pushing reasons)
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 */

level0 = new level(0, 6950);

level0.platforms = [ new platformPrototype(550, 450, "black"),
		new platformPrototype(650, 450, "black"),
		new platformPrototype(750, 450, "black"),
		new platformPrototype(950, 450, "black"),
		new platformPrototype(1150, 450, "black"),
		new platformPrototype(1200, 450, "black"),
		new platformPrototype(1350, 250, "black"),
		new platformPrototype(1500, 350, "black"),
		new platformPrototype(1600, 450, "cyan"),
		new platformPrototype(1750, 450, "cyan"),
		new platformPrototype(1850, 450, "cyan"),
		new platformPrototype(1950, 450, "cyan"),
		new platformPrototype(2200, 450, "magenta"),
		new platformPrototype(2200, 400, "magenta"),
		new platformPrototype(2200, 450, "magenta"),
		new platformPrototype(2300, 450, "magenta"),
		new platformPrototype(2400, 450, "yellow"),
		new platformPrototype(2550, 450, "yellow"),
		new platformPrototype(2700, 250, "yellow"),
		new platformPrototype(2850, 100, "yellow"),
		new platformPrototype(2950, 150, "yellow"),
		new platformPrototype(3050, 150, "yellow"),
		new platformPrototype(3150, 150, "yellow"),
		new platformPrototype(3250, 150, "yellow"),
		new platformPrototype(3350, 150, "yellow"),
		new platformPrototype(3450, 150, "yellow"),
		new platformPrototype(3550, 150, "yellow"),
		new platformPrototype(3650, 150, "yellow"),
		new platformPrototype(3350, 250, "magenta"),
		new platformPrototype(3450, 250, "magenta"),
		new platformPrototype(3550, 250, "magenta"),
		new platformPrototype(3650, 250, "magenta"),
		new platformPrototype(3750, 250, "magenta"),
		new platformPrototype(3850, 250, "magenta"),
		new platformPrototype(3950, 250, "magenta"),
		new platformPrototype(4050, 250, "magenta"),
		new platformPrototype(3700, 400, "cyan"),
		new platformPrototype(3800, 400, "cyan"),
		new platformPrototype(3900, 400, "cyan"),
		new platformPrototype(4000, 400, "cyan"),
		new platformPrototype(4100, 400, "cyan"),
		new platformPrototype(4200, 400, "cyan"),
		new platformPrototype(4300, 400, "cyan"),
		new platformPrototype(4400, 400, "cyan"),
		new platformPrototype(4500, 400, "cyan"),
		new platformPrototype(4600, 400, "cyan"),
		new platformPrototype(4700, 400, "cyan"),
		new platformPrototype(4900, 400, "magenta"),
		new platformPrototype(5050, 250, "magenta"),
		new platformPrototype(5200, 300, "cyan"),
		new platformPrototype(5300, 200, "yellow"),
		new platformPrototype(5450, 100, "cyan"),
		new platformPrototype(5600, 450, "yellow"),
		new platformPrototype(5700, 220, "magenta"),
		new platformPrototype(5850, 300, "cyan"),
		new platformPrototype(6000, 200, "yellow"),
		new platformPrototype(6100, 100, "magenta"),
		new platformPrototype(6250, 450, "black"),
		new platformPrototype(6350, 450, "black"),
		new platformPrototype(6400, 450, "black"),
		new platformPrototype(6500, 450, "black"),
		new platformPrototype(6600, 450, "black"),
		new platformPrototype(6700, 450, "black"),
		new platformPrototype(6800, 450, "black"),
		new platformPrototype(6900, 450, "black") ]

level0.vPlatforms = [ new platformPrototype(3750, -300, "black"),
		new platformPrototype(4150, -200, "black"), ]

level0.floors = []

level1 = new level(1, 6950);

level1.platforms = [ new platformPrototype(550, 350, "black"),
		new platformPrototype(700, 450, "black"),
		new platformPrototype(800, 350, "black"),
		new platformPrototype(950, 250, "cyan"),
		new platformPrototype(1100, 350, "black"),
		new platformPrototype(1200, 450, "magenta"),
		new platformPrototype(1300, 250, "yellow"),
		new platformPrototype(1400, 150, "magenta"),
		new platformPrototype(1600, 450, "cyan"),
		new platformPrototype(1750, 250, "cyan"),
		new platformPrototype(1880, 150, "yellow"),
		new platformPrototype(2100, 450, "magenta"),
		new platformPrototype(2200, 150, "black"),
		new platformPrototype(2200, 200, "black"),
		new platformPrototype(2200, 450, "magenta"),
		new platformPrototype(2300, 350, "cyan"),
		new platformPrototype(2420, 350, "yellow"),
		new platformPrototype(2500, 450, "magenta"),
		new platformPrototype(2600, 250, "magenta"),
		new platformPrototype(2700, 400, "yellow"),
		new platformPrototype(2800, 300, "yellow"),
		new platformPrototype(2900, 300, "cyan"),
		new platformPrototype(3000, 200, "cyan"),
		new platformPrototype(3200, 450, "magenta"),
		new platformPrototype(3300, 450, "yellow"),
		new platformPrototype(3400, 200, "magenta"),
		new platformPrototype(3600, 450, "cyan"),
		new platformPrototype(3700, 400, "cyan"),
		new platformPrototype(3800, 400, "magenta"),
		new platformPrototype(3900, 400, "yellow"),
		new platformPrototype(4000, 400, "cyan"),
		new platformPrototype(4100, 400, "yellow"),
		new platformPrototype(4200, 350, "cyan"),
		new platformPrototype(4300, 250, "magenta"),
		new platformPrototype(4500, 450, "yellow"),
		new platformPrototype(4600, 400, "cyan"),
		new platformPrototype(4700, 200, "yellow"),
		new platformPrototype(4800, 100, "cyan"),
		new platformPrototype(5000, 400, "magenta"),
		new platformPrototype(5100, 300, "yellow"),
		new platformPrototype(5200, 100, "cyan"),
		new platformPrototype(5400, 450, "yellow"),
		new platformPrototype(5500, 300, "cyan"),
		new platformPrototype(5600, 450, "magenta"),
		new platformPrototype(5700, 100, "cyan"),
		new platformPrototype(5900, 400, "yellow"),
		new platformPrototype(6000, 220, "magenta"),
		new platformPrototype(6100, 300, "cyan"),
		new platformPrototype(6250, 200, "yellow"),
		new platformPrototype(6380, 100, "magenta"),
		new platformPrototype(6550, 450, "black"),
		new platformPrototype(6550, 450, "black"),
		new platformPrototype(6600, 450, "black"),
		new platformPrototype(6650, 450, "black"),
		new platformPrototype(6700, 450, "black"),
		new platformPrototype(6750, 450, "black"),
		new platformPrototype(6800, 450, "black"),
		new platformPrototype(6850, 450, "black") ]

level1.vPlatforms = []

level1.floors = []

level2 = new level(2, 7100);

level2.platforms = [ new platformPrototype(0, 450, "black"),
		new platformPrototype(50, 450, "black"),
		new platformPrototype(100, 450, "black"),
		new platformPrototype(150, 450, "black"),
		new platformPrototype(200, 450, "black"),
		new platformPrototype(250, 450, "black"),
		new platformPrototype(300, 450, "black"),
		new platformPrototype(350, 450, "black"),
		new platformPrototype(400, 450, "black"),
		new platformPrototype(450, 450, "black"),

		new platformPrototype(550, 350, "black"),
		new platformPrototype(700, 450, "black"),
		new platformPrototype(800, 450, "black"),
		new platformPrototype(950, 250, "cyan"),
		new platformPrototype(1100, 350, "black"),
		new platformPrototype(1200, 450, "magenta"),
		new platformPrototype(1300, 250, "yellow"),
		new platformPrototype(1400, 150, "magenta"),
		new platformPrototype(1600, 450, "cyan"),

		new platformPrototype(1750, 250, "cyan"),
		new platformPrototype(1880, 150, "yellow"),
		new platformPrototype(2100, 450, "magenta"),
		new platformPrototype(2200, 450, "magenta"),
		new platformPrototype(2300, 350, "cyan"),
		new platformPrototype(2420, 350, "yellow"),
		new platformPrototype(2500, 450, "magenta"),
		new platformPrototype(2600, 250, "magenta"),
		new platformPrototype(2700, 400, "yellow"),
		new platformPrototype(2800, 300, "yellow"),
		new platformPrototype(2900, 300, "cyan"),
		new platformPrototype(3000, 200, "cyan"),
		new platformPrototype(3200, 450, "magenta"),
		new platformPrototype(3300, 450, "yellow"),
		new platformPrototype(3400, 200, "magenta"),
		new platformPrototype(3600, 450, "cyan"),
		new platformPrototype(3700, 400, "cyan"),
		new platformPrototype(3800, 400, "magenta"),
		new platformPrototype(3900, 400, "yellow"),
		new platformPrototype(4000, 400, "cyan"),
		new platformPrototype(4100, 400, "magenta"),
		new platformPrototype(4200, 350, "cyan"),
		new platformPrototype(4300, 250, "magenta"),
		new platformPrototype(4500, 450, "yellow"),
		new platformPrototype(4600, 400, "cyan"),
		new platformPrototype(4700, 200, "yellow"),
		new platformPrototype(4800, 100, "cyan"),
		new platformPrototype(5000, 400, "magenta"),
		new platformPrototype(5100, 300, "yellow"),
		new platformPrototype(5200, 100, "cyan"),
		new platformPrototype(5400, 450, "yellow"),
		new platformPrototype(5500, 300, "cyan"),
		new platformPrototype(5600, 450, "magenta"),
		new platformPrototype(5700, 100, "cyan"),
		new platformPrototype(5900, 400, "yellow"),
		new platformPrototype(6000, 220, "magenta"),
		new platformPrototype(6100, 300, "cyan"),
		new platformPrototype(6250, 200, "yellow"),
		new platformPrototype(6380, 100, "magenta"),
		new platformPrototype(6550, 450, "black"),
		new platformPrototype(6600, 450, "black"),
		new platformPrototype(6650, 450, "black"),
		new platformPrototype(6700, 450, "black"),
		new platformPrototype(6750, 450, "black"),
		new platformPrototype(6800, 450, "black"),
		new platformPrototype(6850, 450, "black"),
		new platformPrototype(6900, 450, "black"),
		new platformPrototype(6950, 450, "black"),
		new platformPrototype(7000, 450, "black") ]

var level3 = new level(3, 7100);

level3.platforms = [ new platformPrototype(0, 450, "black"),
		new platformPrototype(50, 450, "black"),
		new platformPrototype(100, 450, "black"),
		new platformPrototype(150, 450, "black"),
		new platformPrototype(200, 450, "black"),
		new platformPrototype(250, 450, "black"),
		new platformPrototype(300, 450, "black"),
		new platformPrototype(350, 450, "black"),
		new platformPrototype(400, 450, "black"),
		new platformPrototype(450, 450, "black"),
		new platformPrototype(550, 350, "cyan"),
		new platformPrototype(700, 450, "magenta"),
		new platformPrototype(800, 350, "yellow"),
		new platformPrototype(950, 250, "black"),
		new platformPrototype(1100, 350, "cyan"),
		new platformPrototype(1200, 100, "yellow"),
		new platformPrototype(1300, 200, "magenta"),
		new platformPrototype(1400, 330, "yellow"),
		new platformPrototype(1500, 400, "magenta"),
		new platformPrototype(1700, 100, "cyan"),
		new platformPrototype(1800, 240, "yellow"),
		new platformPrototype(1940, 280, "magenta"),
		new platformPrototype(2010, 100, "cyan"),
		new platformPrototype(2200, 210, "yellow"),
		new platformPrototype(2400, 100, "magenta"),
		new platformPrototype(2500, 250, "yellow"),
		new platformPrototype(2600, 400, "cyan"),
		new platformPrototype(2810, 100, "magenta"),
		new platformPrototype(3000, 200, "yellow"),
		new platformPrototype(3100, 400, "magenta"),
		new platformPrototype(3200, 300, "yellow"),
		new platformPrototype(3400, 100, "magenta"),
		new platformPrototype(3510, 220, "cyan"),
		new platformPrototype(3630, 330, "yellow"),
		new platformPrototype(3700, 300, "cyan"),
		new platformPrototype(3800, 100, "cyan"),
		new platformPrototype(3800, 400, "magenta"),
		new platformPrototype(4000, 090, "yellow"),
		new platformPrototype(4100, 180, "cyan"),
		new platformPrototype(4250, 100, "yellow"),
		new platformPrototype(4400, 210, "magenta"),
		new platformPrototype(4500, 290, "yellow"),
		new platformPrototype(4600, 400, "yellow"),
		new platformPrototype(4700, 200, "cyan"),
		new platformPrototype(4800, 120, "magenta"),
		new platformPrototype(5000, 310, "cyan"),
		new platformPrototype(5100, 400, "yellow"),
		new platformPrototype(5300, 50, "magenta"),
		new platformPrototype(5410, 350, "cyan"),
		new platformPrototype(5550, 240, "yellow"),
		new platformPrototype(5700, 100, "cyan"),
		new platformPrototype(5900, 200, "magenta"),
		new platformPrototype(6000, 230, "yellow"),
		new platformPrototype(6200, 300, "yellow"),
		new platformPrototype(6400, 205, "cyan"),
		new platformPrototype(6500, 100, "magenta"),
		new platformPrototype(6550, 450, "black"),
		new platformPrototype(6600, 450, "black"),
		new platformPrototype(6650, 450, "black"),
		new platformPrototype(6700, 450, "black"),
		new platformPrototype(6750, 450, "black"),
		new platformPrototype(6800, 450, "black"),
		new platformPrototype(6850, 450, "black"),
		new platformPrototype(6900, 450, "black"),
		new platformPrototype(6950, 450, "black"),
		new platformPrototype(7000, 450, "black"), ]

var level4 = new level(4, 7100);

level4.platforms = [ new platformPrototype(0, 450, "black"),
		new platformPrototype(50, 450, "black"),
		new platformPrototype(100, 450, "black"),
		new platformPrototype(150, 450, "black"),
		new platformPrototype(200, 450, "black"),
		new platformPrototype(250, 450, "black"),
		new platformPrototype(300, 450, "black"),
		new platformPrototype(350, 450, "black"),
		new platformPrototype(400, 450, "black"),
		new platformPrototype(450, 450, "black"),

		new platformPrototype(500, 100, "cyan"),
		new platformPrototype(600, 450, "magenta"),
		new platformPrototype(750, 420, "yellow"),
		new platformPrototype(890, 100, "cyan"),
		new platformPrototype(1000, 200, "magenta"),
		new platformPrototype(1280, 200, "cyan"),
		new platformPrototype(1280, 200, "magenta"),
		new platformPrototype(1400, 330, "yellow"),
		new platformPrototype(1515, 230, "magenta"),
		new platformPrototype(1660, 400, "cyan"),
		new platformPrototype(1800, 200, "yellow"),
		new platformPrototype(1960, 400, "magenta"),

		new platformPrototype(2120, 200, "cyan"),
		new platformPrototype(2200, 400, "yellow"),
		new platformPrototype(2320, 100, "cyan"),
		new platformPrototype(2460, 100, "magenta"),
		new platformPrototype(2600, 100, "yellow"),
		new platformPrototype(2770, 100, "magenta"),
		new platformPrototype(2900, 100, "cyan"),
		new platformPrototype(3000, 260, "yellow"),
		new platformPrototype(3200, 110, "cyan"),
		new platformPrototype(3380, 225, "magenta"),
		new platformPrototype(3500, 340, "cyan"),
		new platformPrototype(3600, 200, "yellow"),
		new platformPrototype(3750, 100, "cyan"),
		new platformPrototype(3900, 450, "yellow"),
		new platformPrototype(4000, 420, "cyan"),
		new platformPrototype(4100, 390, "magenta"),
		new platformPrototype(4200, 360, "yellow"),
		new platformPrototype(4200, 330, "cyan"),
		new platformPrototype(4300, 300, "magenta"),
		new platformPrototype(4400, 270, "cyan"),
		new platformPrototype(4500, 240, "yellow"),
		new platformPrototype(4600, 210, "cyan"),
		new platformPrototype(4700, 180, "magenta"),
		new platformPrototype(4800, 150, "cyan"),
		new platformPrototype(4900, 120, "yellow"),
		new platformPrototype(5000, 450, "cyan"),
		new platformPrototype(5100, 0, "magentaV"),
		new platformPrototype(5150, 100, "magenta"),
		new platformPrototype(5280, 300, "yellow"),
		new platformPrototype(5400, 100, "cyan"),
		new platformPrototype(5500, 0, "cyanV"),
		new platformPrototype(5600, 100, "cyan"),
		new platformPrototype(5700, 200, "magenta"),
		new platformPrototype(5800, 100, "cyan"),
		new platformPrototype(5850, 300, "yellow"),
		new platformPrototype(6000, 100, "magenta"),
		new platformPrototype(6130, 200, "cyan"),
		new platformPrototype(6200, 340, "yellow"),
		new platformPrototype(6300, 400, "magenta"),
		new platformPrototype(6400, 100, "cyan"),

		new platformPrototype(6550, 450, "black"),
		new platformPrototype(6600, 450, "black"),
		new platformPrototype(6650, 450, "black"),
		new platformPrototype(6700, 450, "black"),
		new platformPrototype(6750, 450, "black"),
		new platformPrototype(6800, 450, "black"),
		new platformPrototype(6850, 450, "black"),
		new platformPrototype(6900, 450, "black"),
		new platformPrototype(6950, 450, "black"),
		new platformPrototype(7000, 450, "black"), ]

level5 = new level(5, 7450);

level5.platforms = [ new platformPrototype(450, 450, "black"),
		new platformPrototype(550, 450, "black"),
		new platformPrototype(650, 450, "black"),
		new platformPrototype(700, 450, "black"),
		new platformPrototype(900, 400, "black"),
		new platformPrototype(1000, 450, "magenta"),
		new platformPrototype(1100, 350, "yellow"),
		new platformPrototype(1250, 350, "yellow"),
		new platformPrototype(1400, 450, "cyan"),
		new platformPrototype(1500, 250, "magenta"),
		new platformPrototype(1600, 250, "magenta"),
		new platformPrototype(1700, 250, "magenta"),
		new platformPrototype(1850, 250, "cyan"),
		new platformPrototype(1900, 350, "black"),
		new platformPrototype(2050, 400, "magenta"),
		new platformPrototype(2150, 200, "yellow"),
		new platformPrototype(2200, 300, "magenta"),
		new platformPrototype(2300, 250, "cyan"),
		new platformPrototype(2550, 200, "cyan"),
		new platformPrototype(2700, 450, "yellow"),
		new platformPrototype(2800, 300, "yellow"),
		new platformPrototype(2950, 400, "cyan"),
		new platformPrototype(3050, 200, "magenta"),
		new platformPrototype(3200, 450, "yellow"),
		new platformPrototype(3300, 450, "yellow"),
		new platformPrototype(3300, 200, "magenta"),
		new platformPrototype(3400, 450, "cyan"),
		new platformPrototype(3400, 150, "cyan"),
		new platformPrototype(3500, 400, "magenta"),
		new platformPrototype(3500, 200, "yellow"),
		new platformPrototype(3700, 400, "magenta"),
		new platformPrototype(3800, 450, "cyan"),
		new platformPrototype(3850, 350, "cyan"),
		new platformPrototype(4000, 250, "magenta"),
		new platformPrototype(4170, 450, "yellow"),
		new platformPrototype(4300, 400, "cyan"),
		new platformPrototype(4400, 200, "yellow"),
		new platformPrototype(4550, 250, "cyan"),
		new platformPrototype(4650, 350, "magenta"),
		new platformPrototype(4800, 400, "cyan"),
		new platformPrototype(4900, 250, "cyan"),
		new platformPrototype(5050, 400, "yellow"),
		new platformPrototype(5200, 300, "cyan"),
		new platformPrototype(5350, 450, "magenta"),
		new platformPrototype(5500, 100, "cyan"),
		new platformPrototype(5650, 300, "yellow"),
		new platformPrototype(5750, 400, "yellow"),
		new platformPrototype(5850, 220, "magenta"),
		new platformPrototype(6000, 350, "cyan"),
		new platformPrototype(6150, 200, "yellow"),
		new platformPrototype(6250, 150, "magenta"),
		new platformPrototype(6350, 250, "cyan"),
		new platformPrototype(6450, 450, "magenta"),
		new platformPrototype(6550, 450, "yellow"),
		new platformPrototype(6650, 450, "cyan"),
		new platformPrototype(6700, 250, "yellow"),
		new platformPrototype(6850, 350, "magenta"),
		new platformPrototype(7050, 450, "black"),
		new platformPrototype(7150, 450, "black"),
		new platformPrototype(7250, 450, "black"),
		new platformPrototype(7350, 450, "black") ];

level5.vPlatforms = [ new platformPrototype(1700, 0, "yellow"),
		new platformPrototype(2400, 0, "magenta"),
		new platformPrototype(3600, 200, "magenta"),
		new platformPrototype(5150, 0, "yellow"),
		new platformPrototype(5450, 0, "cyan"),
		new platformPrototype(5950, 0, "magenta"),
		new platformPrototype(6600, 0, "cyan"),
		new platformPrototype(6800, 0, "magenta"),
		new platformPrototype(7000, 0, "yellow") ];