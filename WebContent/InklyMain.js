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



/****************************************************************************/
/* 								MENUS and Manager							*/
/****************************************************************************/

/**
 * this part is where the code to make all screens (menus and such) are here
 * most of this code is copied from the example JS fiddle for screen 
 * management and sprite movement: http://jsfiddle.net/Selkcip/BMAam/ and then
 * modified to fit our needs. 
 * 
 * For documentation on the functions and objects see: 
 * Documentation/Menus_and_Manager.txt
 */

function Screen(alwaysUpdate, alwaysDraw){
	//sprite constructor called to copy any applicable object properties
	//this also refers to the line after the constructor  
	Sprite.call(this);

	this.alwaysUpdate = alwaysUpdate;
	this.alwaysDraw = alwaysDraw;
	
	this.initialized = false;
	
	this.Stage = new Sprite();
	this.addChild(this.Stage);
	
	this.gui = new GUI(gInput);
	this.addChild(this.gui);
}

//This allows the Screen class to inherit all sprite properties 
Screen.prototype = new Sprite();

Screen.prototype.init = function(){};

function ScreenManager(){
	//Call sprite constructor to inheret sprite properties
	Sprite.call(this);

	this.screens = new List();
}
//inherit all sprite properties just like each screen
ScreenManager.prototype = new Sprite();

ScreenManager.prototype.push = function(screen){
    this.screens.remove(screen);
    this.screens.push(screen);
}

ScreenManager.prototype.pop = function(){
    this.screens.tail.item.gui.visible = false;
    return this.screens.pop();
}

ScreenManager.prototype.remove = function(screen){
    screen.gui.visible = false;
    this.screens.remove(screen);
}

//Update function for the screen manager
ScreenManager.prototype.update = function (d) {
	//simply an easy reference
    var screens = this.screens;
    
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
        if (screen.alwaysUpdate || node == screens.tail) {
            if(!screen.initialized){
                screen.init();
                screen.initialized = true;
            }
            screen.update(d);
        }
    }
};

ScreenManager.prototype.draw = function (ctx) {
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

//creates the main menu screen. 

//TODO: set to false when game is shipped
var mainMenu = new Screen(false,false);

mainMenu.image = Textures.load("MainMenu.png");
screenManager.push(mainMenu);

//All buttons and stuff that goes on the main menu go HERE
mainMenu.init = function(){
    /*
     * since the size of the game is up for debate, the image will be assumed
     * to be variable. 
     */
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.gui.x = canvas.width/2;
    this.gui.y = canvas.height/2;
    
    /* TODO: get logo for our game 
     * Gavin's job
     */
   /* var logo = new Sprite();
    logo.x = canvas.width/2;
    logo.y = canvas.height/2;
    logo.xoffset = -logo.width/2;
    logo.yoffset = -logo.height/2;
    logo.image = Textures.load("LOGO TEXTURE HERE");
   
    mainMenu.stage.addChild(logo);
    */
    var newGame = new TextButton("New Game");
    newGame.center = true;
    newGame.label.dropShadow = true;
    newGame.label.fontSize = 30;
    newGame.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
    this.gui.addChild(newGame);
    
    newGame.func = function(){
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

//Override the empty init function to set some properties
gameScreen.init = function(){
    //Since we set a background we want the screen to fill  the canvas
    this.width = canvas.width;
    this.height = canvas.height;
    // TODO: put all in game stuff here
    
    this.Stage.addChild(inky.Sprite);
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
        screenManager.remove(pauseMenu);
    }
    
    var returnToMenu = new TextButton("Main Menu");
    returnToMenu.y = 50;
    returnToMenu.center = true;
    returnToMenu.label.dropShadow = true;
    returnToMenu.label.fontSize = 30;
    returnToMenu.setLabelColors("#aaaaaa", "#ffffff", "#ff0000");
    this.gui.addChild(returnToMenu);
    returnToMenu.func = function(){
        screenManager.remove(pauseMenu);
        screenManager.remove(gameScreen);
    }
}

//This makes it so that escape will make the pause screen
gInput.addFunc(27, function(){
    if(screenManager.screens.find(gameScreen) && 
    		!screenManager.screens.find(pauseMenu)){
        screenManager.push(pauseMenu);
    }
})

var settingsMenu = new Screen(false,true);

settingsMenu.init = function(){
	
	this.width = canvas.width;
	this.height = canvas.height;
	this.gui.x = canvas.width/2;
    this.gui.y = canvas.height/2;
	//TODO add buttons here
}

/****************************************************************************/
/*					Definition of objects and Sprites						*/
/****************************************************************************/

// constructor for making inky
function inky(){
	//PLACEHOLDER current sprite spawning. Not used here in final version
	inkySprite = new Sprite();
	inkySprite.x = 20;
	inkySprite.y = canvas.height - 60;
	inkySprite.height = 40;
	inkySprite.width = 40;
	//temporary place holder until we get the next image
	inkySprite.image = Textures.load("Inky.png");
	this.Sprite = inkySprite;
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
	//Inky usually falls if not given anything
	this.y += 1;
}