# Inkly!

This was a project I made when I was at UC Santa Cruz in 2014. 
It was a lot of fun and so I've kept it here to show my first experience with JavaScript 

I didn't do this alone, there were two other group members but I haven't been able to get in contact with them as of April 2022. 

Their names are Gavin Hues and Vernon Wong. 

## Installation
This game is hosted over at http://jvbridge.github.io/Inkly/ for all to see, if you wish to host it yourself you can merely download the files and put it in your own web hosting devices

## Usage
It's a pretty self explanatory side scrolling game. Space bar will make you jump, and 1, 2, and 3 change the color of the background. 

If the background color matches an object on the screen, the character will pass through it, if it does not the character will interact on it. 

The goal is to get to the end of the level

## Technology
The game itself is pure javascript put onto a `<canvas>` and uses an engine made by a grad student at the time called brine.js

The main drawback of it is that we didn't set the update loop on an interval, so the game just goes as fast as your computer is willing to render it. So as technology gets better and CPUs get faster the game will get harder and faster. 
