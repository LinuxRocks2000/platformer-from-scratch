function getRightmost(physicsObjects){
    var rightmostVal = Infinity;
    var rightmostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.x < rightmostVal){
            rightmostVal = item.x;
            rightmostObj = item;
        }
    });
    return rightmostObj;
}

function getLeftmost(physicsObjects){
    var leftmostVal = -Infinity;
    var leftmostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.x + item.width > leftmostVal){
            leftmostVal = item.x;
            leftmostObj = item;
        }
    });
    return leftmostObj;
}

function getTopmost(physicsObjects){
    var topmostVal = Infinity;
    var topmostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.y < topmostVal){
            topmostVal = item.y;
            topmostObj = item;
        }
    });
    return topmostObj;
}

function getBottommost(physicsObjects){
    var bottommostVal = -Infinity;
    var bottommostObj = undefined;
    physicsObjects.forEach((item, i) => {
        if (item.y + item.height > bottommostVal){
            bottommostVal = item.x;
            bottommostObj = item;
        }
    });
    return bottommostObj;
}

function pointRelationToLine(x, y, line){
    var val = ((line[3] - line[1]) * x) + ((line[0] - line[2]) * y) + ((line[2] * line[1]) - (line[0] * line[3]));
    return val == 0 ? 0 : val/Math.abs(val); // Find the sign and avoid divide by 0 issues.
} // This returns -1 if the point (x, y) is above the line, 1 if it's below, and equal to 0 if it's on the line.

function isRectOffLine(rect, line){
    var p1Val = pointRelationToLine(rect[0], rect[1], line);
    var p2Val = pointRelationToLine(rect[2], rect[3], line);
    var p3Val = pointRelationToLine(rect[0], rect[3], line);
    var p4Val = pointRelationToLine(rect[2], rect[1], line);
    return p1Val == p2Val && p2Val == p3Val && p3Val == p4Val;
}

function isLineOffRect(rect, line){
    return (line[0] < rect[0] && line[2] < rect[0]) ||
           (line[0] > rect[2] && line[2] > rect[2]) ||
           (line[1] < rect[1] && line[3] < rect[1]) ||
           (line[1] > rect[3] && line[3] > rect[3])
}

class PhysicsObject{
    constructor(game, x, y, width, height, isStatic){
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.xv = 0;
        this.yv = 0;
        this.gravity = 1;
        this.friction = 0.8;
        this.frictionY = 1;
        this.frictionChangeX = 1;
        this.isStatic = isStatic;
        this.collisions = ["solid"]; // Solid is always a collision!
        this.specialCollisions = []; // No default special collisions.
        this.zeroOnHitX = true;
        this.zeroOnHitY = true;
    }

    loop(framesElapsed){
        if (!this.isStatic){
            this.touchingTop = false;
            this.touchingBottom = false;
            this.touchingLeft = false;
            this.touchingRight = false;
            this.xv *= Math.pow(this.friction * this.frictionChangeX, framesElapsed);
            this.yv *= Math.pow(this.frictionY, framesElapsed);
            this.frictionChangeX = 1;
            this.yv += (this.gravity * framesElapsed);
            this.move(this.xv * framesElapsed, 0);
            //this.x = Math.round(this.x);
            var collX = this.doCollision(this.game.checkCollision(this));
            if (collX[0]){
                if (this.xv > 0){ // Positive velocity = moving right
                    this.touchingRight = true;
                    this.x = getRightmost(collX[1]).x - this.width;
                    this.hitRight();
                }
                else if (this.xv < 0){ // Negative velocity =  moving left
                    this.touchingLeft = true;
                    var leftmost = getLeftmost(collX[1]);
                    this.x = leftmost.x + leftmost.width;
                    this.hitLeft();
                }
                if (this.zeroOnHitX){
                    this.xv = 0;
                }
            }
            this.move(0, this.yv * framesElapsed);
            var collY = this.doCollision(this.game.checkCollision(this));
            //this.y = Math.round(this.y);
            if (collY[0]){
                /*while (this.doCollision(this.game.checkCollision(this, collY[1]))[0]){
                    this.move(0, -Math.Math.abs(this.yv)/this.yv);
                }*/
                if (this.yv > 0){ // Positive velocity = moving down
                    this.touchingBottom = true;
                    this.y = getTopmost(collY[1]).y - this.height;
                    this.hitBottom();
                }
                else if (this.yv < 0){ // Negative velocity = moving up
                    this.touchingTop = true;
                    var bottommost = getBottommost(collY[1]);
                    this.y = bottommost.y + bottommost.height;
                    this.hitTop();
                }
                if (this.zeroOnHitY){
                    this.yv = 0;
                }
            }
        }
    }

    doCollision(coll){
        var returner = [false, []];
        this.collisions.forEach((item, i) => {
            if (coll[item][0] > 0){
                returner[0] = true;
                returner[1].push(...coll[item][1]); // This is unpacking magic.
            }
        });
        var noSpecial = true;
        this.specialCollisions.forEach((item, index) => {
            if (coll[item][0] > 0){
                if (this.specialCollision(item, coll[item][1])){
                    returner[0] = true;
                    returner[1].push(...coll[item][1]);
                }
                noSpecial = false;
            }
            else{
                this.noSpecial(item);
            }
        });
        return returner;
    }

    move(xm, ym){
        this.x += xm;
        this.y += ym;
    }

    hitBottom(){

    }

    hitTop(){

    }

    hitLeft(){

    }

    hitRight(){

    }

    specialCollision(type){

    }

    noSpecial(type){

    }
}


class Brick extends PhysicsObject{
    constructor(game, x, y, width, height, style, type, isStatic){
        super(game, x, y, width, height, isStatic);
        this.game = game;
        this.element = document.createElement("div");
        document.getElementById("game").appendChild(this.element);
        this.type = type;
        this.element.classList.add(style);
        this.element.classList.add(type);
        if (type == "tencoin"){
            this.element.innerHTML = "<span>10</span>";
        }
        if (type == "fiftycoin"){
            this.element.innerHTML = "<span>50</span>";
        }
        // This happens last!
        this.draw();
    }

    draw(){
        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
        this.element.style.left = (this.x - this.game.player.x + (window.innerWidth - this.game.player.width) / 2) + "px";
        this.element.style.top = (this.y - this.game.player.y + (window.innerHeight - this.game.player.height) / 2) + "px";
    }

    remove(){
        this.element.parentNode.removeChild(this.element);
    }
}


class NormalEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.xv = 5;
        this.friction = 1;
        this.isStatic = false;
        this.zeroOnHitX = false;
    }

    hitLeft(){
        this.xv *= -1;
    }

    hitRight(){
        this.xv *= -1;
    }
}


class FlyerEnemy extends Brick{
    constructor(game, x, y, width, height, style, type, config){
        super(game, x, y, width, height, style, type);
        this.gravity = 0;
        this.friction = 0.9;
        this.frictionY = 0.9;
        this.isStatic = false;
        this.collisions.push("jumpthrough");
        this.TTL = config.lifetime || Infinity;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.TTL -= framesElapsed;
        if (this.TTL <= 0){
            this.game.deleteBrick(this);
        }
        if (this.game.player.x > this.x){ // If the player is behind the enemy, move backwards
            this.xv += framesElapsed;
        }
        else if (this.game.player.x < this.x){ // Else if only runs if the last if statement didn't run (like else), but also checks for conditions, hence the name.
            this.xv -= framesElapsed;
        }
        if (this.game.player.y > this.y){ // If the player is further down than the enemy, move down.
            this.yv += framesElapsed;
        }
        else if (this.game.player.y < this.y){ // The reverse.
            this.yv -= framesElapsed;
        }
    }
}


class GunnerEnemy extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.phase = 0;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        this.phase += framesElapsed;
        if (this.phase >= 75){
            this.phase = 0;
            this.game._create(this.x, this.y - 50, 10, 10, "lava", "killu", FlyerEnemy, {lifetime: 75});
        }
    }
}


class BatEnemy extends Brick{
    constructor(game, x, y, width, height, style, type){
        super(game, x, y, width, height, style, type);
        this.state = 0;
        this.isStatic = true;
    }

    loop(framesElapsed){
        super.loop(framesElapsed);
        var lineToPlayer = [this.game.player.x, this.game.player.y, this.x, this.y];
        var canSee = true;
        this.game.tileset.forEach((item, i) => {
            var rect = [item.x, item.y, item.x + item.width, item.y + item.height];
            if (!isRectOffLine(rect, lineToPlayer) && !isLineOffRect(rect, lineToPlayer) && item != this){
                canSee = false;
            }
        });
        if (this.state == 0){
            if (canSee){
                this.state = 1;
                this.isStatic = false;
            }
        }
        if (this.state == 2){
            if (this.game.player.x > this.x){ // If the player is behind the enemy, move backwards
                this.xv += framesElapsed;
            }
            else if (this.game.player.x < this.x){ // Else if only runs if the last if statement didn't run (like else), but also checks for conditions, hence the name.
                this.xv -= framesElapsed;
            }
            if (this.game.player.y > this.y){ // If the player is further down than the enemy, move down.
                this.yv += framesElapsed;
            }
            else if (this.game.player.y < this.y){ // The reverse.
                this.yv -= framesElapsed;
            }
        }
    }

    hitBottom(){
        if (this.state == 1){
            this.state = 2;
            this.gravity = 0;
            this.friction = 0.9;
            this.frictionY = 0.9;
        }
    }
}


class Player extends PhysicsObject{
    constructor(game, x, y, width, height){
        super(game, x, y, width, height);
        this.element = document.createElement("div");
        document.getElementById("game").appendChild(this.element);
        this.element.classList.add("player");
        this.keysHeld = {}; // {} means a new dictionary-like object.
        document.addEventListener("keydown", (event) => {
           this.keysHeld[event.key] = true;
        });
        document.addEventListener("keyup", (event) => {
            this.keysHeld[event.key] = false;
        });
        this.specialCollisions.push("killu"); // Register killu as a special collision type
        this.specialCollisions.push("tencoin") // Add ten coins to special collisions
        this.specialCollisions.push("fiftycoin"); // Fifty coins
        this.specialCollisions.push("jumpthrough");
        this.specialCollisions.push("ice");
        this.specialCollisions.push("tar");
        this.specialCollisions.push("end");
        this._score = 0;
        this.jumpthroughing = false;
        this.timerate = 1; // This multiplies the number of frames, allowing player to speed
    }

    set score(val){
        this._score = val;
        this.element.innerHTML = this._score;
    }

    get score(){
        return this._score;
    }

    draw(){
        this.element.style.left = (window.innerWidth - this.width) / 2 + "px";
        this.element.style.top = (window.innerHeight - this.height) / 2 + "px";
        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
    }

    Jump(){
        if (this.touchingBottom){
            this.yv = -22;
        }
    }

    Left(framesElapsed){
        this.xv -= 3 * framesElapsed;
    }

    Right(framesElapsed){
        this.xv += 3 * framesElapsed;
    }

    loop(framesElapsed){
        framesElapsed *= this.timerate;
        super.loop(framesElapsed);
        if (this.keysHeld["ArrowUp"]){
            this.Jump();
        }
        if (this.keysHeld["ArrowLeft"]){
            this.Left(framesElapsed);
        }
        if (this.keysHeld["ArrowRight"]){
            this.Right(framesElapsed);
        }
    }

    specialCollision(type, items){
        if (type == "killu"){
            this.game.die();
        }
        if (type == "tencoin"){
            items.forEach((item, index) => {
            	this.game.deleteBrick(item);
                this.score += 10;
            });
        }
        if (type == "fiftycoin"){
            items.forEach((item, index) => {
            	this.game.deleteBrick(item);
                this.score += 50;
            });
        }
        if (type == "jumpthrough"){
            if (this.yv <= 0){ // It's moving up
                this.jumpthroughing = true;
            }
            else{
                if (!this.jumpthroughing){
                    return true;
                }
            }
        }
        if (type == "ice"){
            this.frictionChangeX = 0.99/this.friction; // Arithmetic. this.friction * 1 / this.friction == this.friction / this.friction == 1. We can do the same thing with 0.99, 0.8, etc, but 1 will do for now.
            return true; // Ice is always solid
        }
        if (type == "tar"){
            this.frictionChangeX = 0.5/this.friction;
            return true;
        }
        if (type == "end"){
            this.game.win();
        }
    }

    noSpecial(type){
        if (type == "jumpthrough"){
            this.jumpthroughing = false;
        }
    }

    endGame(){
        this.element.style.display = "none"; // This sets the css property display to none, hiding it and making it inactive.
    }

    reset(){
        this.x = this.game.startX;
        this.y = this.game.startY;
        this.element.style.display = ""; // Leaving it blank means it will go to the default, or what we set in main.css.
        this.xv = 0;
        this.yv = 0;
    }
}


class Game {
    constructor(blockWidth, blockHeight){
        this.blockWidth = blockWidth;
        this.blockHeight = blockHeight;
        this.tileset = [];
        this.startX = 50;
        this.startY = 0;
        this.player = new Player(this, this.startX, this.startY, this.blockWidth, this.blockHeight * 2); // Players are usually 1x2 blocks. Feel free to change as you wish.
        this.playing = false;
    }

    _create(x, y, width, height, style, type, bricktype = Brick, config = {}){
        var b = new bricktype(this, x, y, width, height, style, type, config); // Put it in a variable so we can return it later
        this.tileset.push(b); // Add it to the tileset
        return b; // Return it, so you can call this function and then do operations immediately.
    }

    create(x, y, width, height, style, type, bricktype = Brick, config = {}){
        return this._create(x * this.blockWidth, y * this.blockHeight, width * this.blockWidth, height * this.blockHeight, style, type, bricktype, config);
    }

    loop(framesElapsed){
        if (this.playing){
            this.tileset.forEach((item, i) => {
                item.loop(framesElapsed);
                item.draw();
            });
            this.player.loop(framesElapsed);
            this.player.draw();
        }
    }

    checkCollision(object, objects = this.tileset){
        var collisionsDict = {
            "solid": [0, []], // Remember the word "solid" from when you created a brick? This references that!
            "allBricks": [0, []], // Each entry stores an array containing a number (the number of things in it) and another array, the things themselves.
            "allPlayers": [0, []], // Every player in the collision. Above is every block.
            "all": [0, []], // Everything
            "killu": [0, []], // The type is "killu". I know, I know. I wrote this when I was 12 and wasn't motivated enough to change the names.
            "tencoin": [0, []],
            "fiftycoin": [0, []],
            "jumpthrough": [0, []],
            "ice": [0, []],
            "tar": [0, []],
            "end": [0, []]
        }
        objects.forEach((item, i) => {
            if (object.x + object.width > item.x && // && means "and"
                object.x < item.x + item.width &&
               	object.y + object.height > item.y &&
               	object.y < item.y + item.height){
                if (item.type != undefined){ // Don't do this for items that don't have a type, it'll break if you do!
                    collisionsDict[item.type][0] ++; // Increment the first item (javascript is 0 indexed, meaning 0 is the first item in a list)
                    collisionsDict[item.type][1].push(item); // Add the item to the array at index 1 (the second element)
                }
                collisionsDict["all"][0] ++; // Same but for "all". Note that this is not inside the type-protection if; all things are treated equally here.
                collisionsDict["all"][1].push(item);
            }
        });
        return collisionsDict;
    }

    clear(){ // Clear the stuff from the level.
        this.tileset.forEach((item, index) => {
            item.remove();
        });
        this.tileset.splice(0, this.tileset.length);
        this.player.endGame();
        this.playing = false;
        document.getElementById("menu").style.display = "";
    }

    doShowThing(element){
        element.style.display = ""; // Show the element by resetting display (we've seen this before!)
        setTimeout(() => {
            element.style.display = "none"; // Hide the element by setting display to none (we've seen this before as well!)
        }, 2000);
    }

    die(){
        this.clear();
        levels.levelNum --;
        this.doShowThing(document.getElementById("youlose"));
    }

    win(){
        this.clear();
        this.doShowThing(document.getElementById("youwin"));
    }

    deleteBrick(brick){
        brick.remove();
        this.tileset.splice(this.tileset.indexOf(brick), 1);
    }

    reset(){
        this.playing = true;
        this.player.reset();
    }
}


class LevelManager{
    constructor(game){
        this.game = game;
        this.levels = [];
        this.levelNum = 0;
        this.curLevel = undefined;
        this.updateLevelName();
    }

    addLevel(level){
        this.levels.push(level);
    }

    nextLevel(){
        this.curLevel = this.levels[this.levelNum];
        this.curLevel.create(this.game);
        this.levelNum ++;
        this.updateLevelName();
    }

    play(){
        document.getElementById("menu").style.display = "none";
        this.nextLevel();
    }

    updateLevelName(){
        document.getElementById("levelname").innerText = this.levelNum;
    }
}


// Demo


const FirstLevel = {
    create(game){
        game.reset();
        game.create(-5, 8, 20, 1, "normal", "solid");

        game.create(-2, 4, 14, 1, "normal", "solid");
        game.create(11, 3, 1, 1, "normal", "solid");
        game.create(2, 3, 1, 1, "coin", "tencoin");
        game.create(3, 3, 1, 1, "coin", "fiftycoin");
        game.create(7, 7, 1, 1, "coin", "tencoin");
        game.create(8, 7, 1, 1, "coin", "tencoin");
        game.create(9, 7, 1, 1, "coin", "tencoin");

        game.create(5, 0, 1, 1, "normal", "solid");
        game.create(6, 0, 3, 1, "jumpthrough", "jumpthrough");
        game.create(9, 0, 1, 1, "normal", "solid");
        game.create(2, 0, 3, 1, "tar", "tar");

        game.create(8, 6, 1, 1,  "lava", "killu", BatEnemy);

        game.create(8, -1, 1, 1, "end", "end");
    },
    run(){ // We aren't using this yet

    },
    destroy(){ // Or this

    }
};


const SecondLevel = {
    create(game){
        game.reset();
        game.create(-3, 3, 10, 1, "normal", "solid");
    }
};

var game = new Game(50, 50);
const levels = new LevelManager(game);

levels.addLevel(FirstLevel);
levels.addLevel(SecondLevel);
//levels.nextLevel(); // Start it

const FPS = 50;
const millisPerFrame = 1000 / FPS;
var lastFrameTime = 0;

window.onfocus = function(){
    lastFrameTime = window.performance.now();
}

function mainloop(){
    if (document.hasFocus()){
        var distTime = window.performance.now() - lastFrameTime;
        lastFrameTime = window.performance.now();
        var framesElapsed = distTime/millisPerFrame;
        game.loop(framesElapsed);
    }
    window.requestAnimationFrame(mainloop);
}
window.requestAnimationFrame(mainloop);
