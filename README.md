# Inkly!

This was a project I made when I was at UC Santa Cruz in 2014. 
It was a lot of fun and so I've kept it here to show my first experience with JavaScript 

I didn't do this alone, there were two other group members but I haven't been able to get in contact with them as of April 2022. 

Their names are Gavin Hues and Vernon Wong. 

Gavin made most of the art and the music, Vernon did level design

## Installation
This game is hosted over at http://jvbridge.github.io/Inkly/ for all to see, if you wish to host it yourself you can merely download the files and put it in your own web hosting devices

## Usage
It's a pretty self explanatory side scrolling game. Space bar will make you jump, and 1, 2, and 3 change the color of the background. 

If the background color matches an object on the screen, the character will pass through it, if it does not the character will interact on it. 

The goal is to get to the end of the level

## Technology
The game itself is pure javascript put onto a `<canvas>` and uses an engine made by a grad student at the time called brine.js

The main drawback of it is that we didn't set the update loop on an interval, so the game just goes as fast as your computer is willing to render it. So as technology gets better and CPUs get faster the game will get harder and faster. 

## License
Copyright © 2014  Jonathan Bridge, Gavin Hughes, Vernon Wong

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.