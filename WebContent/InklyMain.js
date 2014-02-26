/**
 * This is the main javascript file. It should be treated as the initialization
 * function
 */
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

/*
 * TODO: reformat this when we get new structure background is the sprite which
 * all things are added to. When the "camera" moves, what's really happening is
 * that the background is moving in the opposite direction
 */
background = new Sprite;
background.width = 1000;
background.height = 1000;
background.x = 0;
background.y = 0;

palette = new Sprite;
palette.width = 100;
palette.height = 100;
palette.x = canvas.width / 2 - palette.width / 2;
palette.y = 10;
palette.image = Textures.load("0.jpg");

var colorMode = "none";

var platforms = new Array();

var gravity = 8;

/** ************************************************************************* */
/* MENUS and Manager */
/** ************************************************************************* */

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
	// Call sprite constructor to inheret sprite properties
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

	/*
	 * TODO: get logo for our game Gavin's job
	 */
	/*
	 * var logo = new Sprite(); logo.x = canvas.width/2; logo.y =
	 * canvas.height/2; logo.xoffset = -logo.width/2; logo.yoffset =
	 * -logo.height/2; logo.image = Textures.load("LOGO TEXTURE HERE");
	 * 
	 * mainMenu.stage.addChild(logo);
	 */
	var newGame = new TextButton("New Game");
	newGame.center = true;
	newGame.label.dropShadow = true;
	newGame.label.fontSize = 30;
	newGame.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
	this.gui.addChild(newGame);

	newGame.func = function() {
		screenManager.push(gameScreen);
	}

	var resumeGame = new TextButton("Resume Game");
	resumeGame.y = 50;
	resumeGame.center = true;
	resumeGame.label.dropShadow = true;
	resumeGame.label.fontSize = 30;
	resumeGame.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
	this.gui.addChild(resumeGame);

	var credits = new TextButton("Credits");
	credits.y = 100;
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

/** ************************************************************************* */
/* Definition of objects and Sprites */
/** ************************************************************************* */

// constructor for making inky
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

	/*
	 * int that holds inky's velocity. This is updated each update loop and is
	 * modified by functions
	 */
	var velocity = 0;

	/*
	 * integers used to compare inky's previous location with its current one
	 * useful for collision detection
	 */
	previousX = inkySprite.x;
	previousY = inkySprite.y;

}

// create inky
inky = new inky();

// update function for inky
inky.Sprite.update = function(d) {

	/*
	 * these lines should ALWAYS be first. Also all movement of sprite has
	 * should be defined here, do NOT move anything from anywhere else.
	 */
	inky.previousX = this.x
	inky.previousY = this.y;

	inky.velocity = gravity;

	if (gInput.jump) {
		console.log("jump!");
		// this.y -= 16;
		inky.velocity = -16;
	}
	if (gInput.cyan) {
		colorMode = "cyan";
		updatePlatforms();
		palette.image = Textures.load("2.jpg");
		gameScreen.image = Textures.load("BackgroundC.png");
		console.log("cyan!");
	}
	if (gInput.yellow) {
		colorMode = "yellow";
		updatePlatforms();
		palette.image = Textures.load("3.jpg");
		gameScreen.image = Textures.load("BackgroundY.png");
		console.log("yellow!");
	}
	if (gInput.magenta) {
		colorMode = "magenta"
		updatePlatforms();
		palette.image = Textures.load("1.jpg");
		gameScreen.image = Textures.load("BackgroundM.png");
		console.log("magenta!");
	}

	// this loop detects if Inky is touching anything
	var collide = false;

	for (var i = 0; i < platforms.length; i++) {
		if (spriteCollide(platforms[i].sprite) && !gInput.jump) {
			inky.velocity = 0;
		}
	}

	// this changes inky's location finally
	this.y += inky.velocity;

	background.x -= 1;
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

}

platform.update = function(d) {
	// spriteCollide(this.sprite);
}
/** ************************************************************************* */
/* Helper functions */
/** ************************************************************************* */

// gets the x value of a sprite relative to the Stage
function getX(sprite) {
	return sprite.x + background.x;
}

//gets the y value of a sprite relative to the stage
function getY(sprite) {
	return sprite.y + background.y;
}


//updates all the platfroms with the appropriate colors
function updatePlatforms(){
	
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
		// console.log("right + bottom!");
		return true;
	}

	if (leftCollide && bottomCollide) {
		// console.log("left + bottom!");
		return true;
	}

	if (rightCollide && topCollide) {
		// console.log("right + top!");
		return true;
	}

	if (leftCollide && topCollide) {
		// console.log("left + bottom!");
		return true;
	}

}

new platform(0, 450, "cyan");
new platform(200, canvas.height - 70, "magenta");
new platform(250, canvas.height - 30, "yellow");
new platform(360, canvas.height - 80, "black");
