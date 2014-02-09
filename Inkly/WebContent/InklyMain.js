/**
 * this is the main JavaScript file for our game. I expect that we will need
 * more files by the time we have finished it. 
 */
use2D = true;
initGame("myCanvas");

//initialization function
function init(){
	/*
	 * these are the inputs for the game, the bools cyan, magenta, yellow and
	 * jump map to 1, 2, 3, and space respectively. In future releases we can
	 * choose to make they keys captured from another menu
	 */
	gInput.addBool(49, "cyan");
	gInput.addBool(50, "magenta");
	gInput.addBool(51, "yellow");
	gInput.addBool(32, "jump");
}

//creates our hero
inky = new inky();

//this is the function to create Inky's object 
function inky(){
	//PLACEHOLDER current sprite spawning. Not used here in final version
	inkySprite = new Sprite();
	inkySprite.x = 20;
	inkySprite.y = 480;
	inkySprite.height = 40;
	inkySprite.width = 40;
	//temporary place holder until we get the next image
	inkySprite.image = Textures.load("Inky.png");
	this.Sprite = inkySprite;
	world.addChild(inkySprite);
}

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

plat = new Sprite();
plat.image = Textures.load("CyanPlatform.png");
plat.x = 0;
plat.y = 50;
plat.height = 20;
plat.width = 40;
inky.Sprite.addChild(plat);


//call init after everything is defined.
init();