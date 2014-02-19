/**
 * This is the main javascript file. It should be treated as the 
 * initialization function 
 */
use2D = true;
initGame("myCanvas");

/*
 * these are the inputs for the game, the bools cyan, magenta, yellow,
 * jump, and menu map to 1, 2, 3, space, and escape respectively. In 
 * future releases we can choose to make they keys captured from another 
 * menu
 */
gInput.addBool(49, "cyan");
gInput.addBool(50, "magenta");
gInput.addBool(51, "yellow");
gInput.addBool(32, "jump");
gInput.addBool(27, "escape");

/*
 * this code has been commented out since we don't need to spawn inky yet in 
 * this point in the development 

// constructor for making inky
function inky(){
	//PLACEHOLDER current sprite spawning. Not used here in final version
	inkySprite = new Sprite();
	inkySprite.x = 20;
	inkySprite.y = canvis.height - 60;
	inkySprite.height = 40;
	inkySprite.width = 40;
	//temporary place holder until we get the next image
	inkySprite.image = Textures.load("Inky.png");
	this.Sprite = inkySprite;
	world.addChild(inkySprite);
}

//create inky
inky = new inky();

//update function for inky
inky.Sprite.update = function(d){
	if (gInput.jump){
		console.log("jump!");
		this.y -= 2;
	}
	if (gInput.cyan){
		console.log("cyan!");
	}
	if (gInput.yellow){
		console.log("yellow!");
	}
	if (gInput.magenta){
		console.log("magenta!");
	} 
	this.y += 1;
}

/*
 * this part is where the code to make all screens (menus and such) are here
 * most of this code is copied from the example JS fiddle for screen 
 * management and sprite movement: http://jsfiddle.net/Selkcip/BMAam/
 */

//screen constructor
function Screen(alwaysUpdate, alwaysDraw){
	//sprite constructor called to copy any applicable object properties
	//this also refers to the line after the constructor  
	Sprite.call(this);
	
	//args here for determining if the screen should update or not
	this.alwaysUpdate = alwaysUpdate;
	this.alwaysDraw = alwaysDraw;
	
	/* this booleon is used to determine if the screen has been initialized or
	 * not, it is assumed that the screen has not been initialized
	 */
	this.initialized = false;
	
	//stage is our sprite for the backgrounds
	this.Stage = new Sprite();
	this.addChild(this.Stage);
	
	this.gui = new GUI(gInput);
	this.addChild(this.gui);
}

//This allows the Screen class to inherit all sprite properties 
Screen.prototype = new Sprite();

/*
 * this is the screen manager class. It contains a list of all screens to use
 * as well as a series of functions to make said classes
 */
function ScreenManager(){
	//Call sprite constructor to inheret sprite properties
	Sprite.call(this);
	
	//list of all screens, data structure type is a stack
	this.Screens = new List();
}
//inherit all sprite properties just like each screen
ScreenManager.prototype = new Sprite();

/*
 * these functions are all used to push, pop, or remove screens from the 
 * ScreenManager stack, and are named as such. 
 */

ScreenManager.prototype.push = function(screen){
    this.screens.remove(screen);
    this.screens.push(screen);
};

ScreenManager.prototype.pop = function(){
    this.screens.tail.item.gui.visible = false;
    return this.screens.pop();
};

ScreenManager.prototype.remove = function(screen){
    screen.gui.visible = false;
    this.screens.remove(screen);
};

//Update function for the screen manager
ScreenManager.prototype.update = function (d) {
	//simply an easy reference
    var screens = this.screens;
    
    /* Loop through the screens and update if they are supposed to always 
     * update or if they are the top screen
     */
    for (var node = screens.head; node != null; node = node.link) {
        //makes a reference for easy reference to the node
    	var screen = node.item;
        
        /*The gui wasn't exactly made for this situation so we need to hide it
         * if it's not in the current screen. The tail of the screens list
         * is the current screen.
         */
        if(node != screens.tail){
            screen.gui.visible = false;
        }else{
            screen.gui.visible = true;
        }
        //sets the appropriate screen when needed.
        if (screen.alwaysUpdate || node == screens.tail) {
            if(!screen.initialized){
                screen.init();
                screen.initialized = true;
            }
            screen.update(d);
        }
    }
};

//The draw function needs to be overridden as well to mimic the update 
//function except this checks alwaysDraw instead of alwaysUpdate
ScreenManager.prototype.draw = function (ctx) {
    var screens = this.screens;
    
    for (var node = screens.head; node != null; node = node.link) {
        var screen = node.item;
        if (screen.alwaysDraw || node == screens.tail) {
            screen.draw(ctx);
        }
    }
};

// this is the part for running the game. Specific management works here best
var screenManager = new ScreenManager();

//Sceen Manager has inhereted sprite properties so it can be added to the world
world.addChild(screenManger);

//creates the main menu screen. 
var mainMenu = new Screen(false,false);

Textures.load("MainMenu.png");
screenMan.push(mainMenu);

//Override the empty init function to set some properties
mainMenu.init = function(){
    /*
     * since the size of the game is up for debate, the image will be assumed
     * to be variable. 
     */
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.gui.x = canvas.width/2;
    this.gui.y = canvas.height/2;
    
    //Add some sprites to the main menu
    /*
     * these are default menus given by brine. Ours will be different
    var logo = new Sprite();
    logo.x = canvas.width/2;
    logo.y = canvas.height/2;
    logo.xoffset = -logo.width/2;
    logo.yoffset = -logo.height/2;
    logo.image = Textures.load("http://www.jar42.com/brine/starter/images/logo_filled.png");
    logo.update = function(d){
        logo.rotation += 0.01;
    }
    mainMenu.stage.addChild(logo);
    
    var newGame = new TextButton("New Game");
    newGame.center = true;
    newGame.label.dropShadow = true;
    newGame.label.fontSize = 30;
    newGame.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
    this.gui.addChild(newGame);
    
    newGame.func = function(){
        screenMan.push(gameScreen);
    }
    
    var resumeGame = new TextButton("Resume Game");
    resumeGame.y = 50;
    resumeGame.center = true;
    resumeGame.label.dropShadow = true;
    resumeGame.label.fontSize = 30;
    resumeGame.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
    this.gui.addChild(resumeGame);
    */
}

/*
 * more of his code that I need to understand before I use it
 * this is included in this commit so that we can all look through it together
 * 

var gameScreen = new Screen(false, true);
gameScreen.image = Textures.load("http://www.jar42.com/brine/laststop/images/grass.png");

//Override the empty init function to set some properties
gameScreen.init = function(){
    //Since we set a background we want the screen to fill  the canvas
    this.width = canvas.width;
    this.height = canvas.height;
    
    //Create a new Sprite
			var mySprite = new Sprite();
			
			//Set its dimensions
			mySprite.width = 256;
			mySprite.height = 256;
			
			//Shift the sprite so that its origin is at its center
			//The offset is negative because we are moving the sprite relative to its origin and not the origin relative to the sprite
			mySprite.xoffset = -mySprite.width/2;
			mySprite.yoffset = -mySprite.height/2;
			
			//Set the sprite's texture
			mySprite.image = Textures.load("http://www.jar42.com/brine/starter/images/logo_filled.png");
			
			//Add the sprite to the world
			this.stage.addChild(mySprite);
			
			//A
			gInput.addBool(65, "left");
			//D
			gInput.addBool(68, "right");
			//S
			gInput.addBool(83, "down");
			//W
			gInput.addBool(87, "up");
			
			//Override the default update function
			//Define some variables to hold the sprite's x and y velocities
			var xvel = 1;
			var yvel = 1;
			mySprite.update = function(d){
				//Define a speed to move at
				var speed = 2;
				
				//If the A key is pressed move to the left
				if(gInput.left){
					this.x -= speed;
				}
				
				//If the D key is pressed move to the right
				if(gInput.right){
					this.x += speed;
				}
				
				//If the S key is pressed move down
				if(gInput.down){
					//Note that an increasing y means moving down the screen
					this.y += speed;
				}
				
				//If the W key is pressed move up
				if(gInput.up){
					this.y -= speed;
				}
				
				//Make the sprite warp to the opposite side of the canvas when it goes off a side
				//If it goes off the left or right edge
				if(this.x < 0){
					this.x = canvas.width; //Place it on the right side
				}else if(this.x > canvas.width){
					this.x = 0; //Place it on the left side
				}
				
				//If it goes off the top or bottom edge
				if(this.y < 0){
					this.y = canvas.height; //Place it at the bottom
				}if(this.y > canvas.height){
					this.y = 0; //Place it at the top
				}
				
				//Find the horizontal distance between the sprite and the mouse
				var xDis = gInput.mouse.x-this.x;
				
				//Find the vertical distance between the sprite and the mouse
				var yDis = gInput.mouse.y-this.y;
				
				//Use those distances and the arctangent to calculate the angle from the sprite to the mouse
				var angle = Math.atan2(yDis, xDis);
				
				//Set the sprite's rotation to the calculated angle
				this.rotation = angle;
			}
}

var pauseMenu = new Screen(false, true);
//Override the empty init function to set some properties
pauseMenu.init = function(){
    //Since we set a background we want the screen to fill  the canvas
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.gui.x = canvas.width/2;
    this.gui.y = canvas.height/2;
    
    var resumeGame = new TextButton("Resume Game");
    resumeGame.center = true;
    resumeGame.label.dropShadow = true;
    resumeGame.label.fontSize = 30;
    resumeGame.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
    this.gui.addChild(resumeGame);
    resumeGame.func = function(){
        screenMan.remove(pauseMenu);
    }
    
    var returnToMenu = new TextButton("Main Menu");
    returnToMenu.y = 50;
    returnToMenu.center = true;
    returnToMenu.label.dropShadow = true;
    returnToMenu.label.fontSize = 30;
    returnToMenu.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
    this.gui.addChild(returnToMenu);
    returnToMenu.func = function(){
        screenMan.remove(pauseMenu);
        screenMan.remove(gameScreen);
    }
}

gInput.addFunc(27, function(){
    if(screenMan.screens.find(gameScreen) && !screenMan.screens.find(pauseMenu)){
        screenMan.push(pauseMenu);
    }
});*/