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
        this.isStatic = isStatic;
        this.collisions = ["solid"]; // Solid is always a collision!
        this.specialCollisions = []; // No default special collisions.
    }

    loop(){
        if (!this.isStatic){
            this.touchingTop = false;
            this.touchingBottom = false;
            this.touchingLeft = false;
            this.touchingRight = false;
            this.xv *= this.friction;
            this.yv += this.gravity;
            this.move(this.xv, 0);
            var collX = this.doCollision(this.game.checkCollision(this));
            if (collX[0]){
                while (this.doCollision(this.game.checkCollision(this, collX[1]))[0]){
                    this.move(-Math.abs(this.xv)/this.xv, 0);
                }
                if (this.xv > 0){ // Positive velocity = moving right
                    this.touchingRight = true;
                }
                else if (this.xv < 0){ // Negative velocity =  moving left
                    this.touchingLeft = true;
                }
                this.xv = 0;
            }
            this.move(0, this.yv);
            var collY = this.doCollision(this.game.checkCollision(this));
            if (collY[0]){
                while (this.doCollision(this.game.checkCollision(this, collY[1]))[0]){
                    this.move(0, -Math.abs(this.yv)/this.yv);
                }
                if (this.yv > 0){ // Positive velocity = moving down
                    this.touchingBottom = true;
                }
                else if (this.yv < 0){ // Negative velocity = moving up
                    this.touchingTop = true;
                }
                this.yv = 0;
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
        return returner;
    }

    move(xm, ym){
        this.x += xm;
        this.y += ym;
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
        // This happens last!
        this.draw();
    }

    draw(){
        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
        this.element.style.left = (this.x - this.game.player.x + (window.innerWidth - this.game.player.width) / 2) + "px";
        this.element.style.top = (this.y - this.game.player.y + (window.innerHeight - this.game.player.height) / 2) + "px";
    }
}


class Player extends PhysicsObject{
    constructor(game, x, y, width, height){
        super(game, x, y, width, height);
        this.element = document.createElement("div");
        document.getElementById("game").appendChild(this.element);
        this.element.classList.add("player");
        this.draw();
        this.keysHeld = {}; // {} means a new dictionary-like object.
        document.addEventListener("keydown", (event) => {
           this.keysHeld[event.key] = true;
        });
        document.addEventListener("keyup", (event) => {
            this.keysHeld[event.key] = false;
        });
    }

    draw(){
        this.element.style.left = (window.innerWidth - this.width) / 2 + "px";
        this.element.style.top = (window.innerHeight - this.height) / 2 + "px";
        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
    }

    Jump(){
        if (this.touchingBottom){
            this.yv = -20;
        }
    }

    Left(){
        this.xv -= 3;
    }

    Right(){
        this.xv += 3;
    }

    loop(){
        super.loop();
        if (this.keysHeld["ArrowUp"]){
            this.Jump();
        }
        if (this.keysHeld["ArrowLeft"]){
            this.Left();
        }
        if (this.keysHeld["ArrowRight"]){
            this.Right();
        }
    }
}


class Game {
    constructor(blockWidth, blockHeight){
        this.blockWidth = blockWidth;
        this.blockHeight = blockHeight;
        this.tileset = [];
        this.player = new Player(this, 50, 0, this.blockWidth, this.blockHeight * 2); // Players are usually 1x2 blocks. Feel free to change as you wish.
    }

    _create(x, y, width, height, style, type){
        var b = new Brick(this, x, y, width, height, style, type, true); // Put it in a variable so we can return it later
        this.tileset.push(b); // Add it to the tileset
        return b; // Return it, so you can call this function and then do operations immediately.
    }

    create(x, y, width, height, style, type){
        return this._create(x * this.blockWidth, y * this.blockHeight, width * this.blockWidth, height * this.blockHeight, style, type);
    }

    loop(){
        this.tileset.forEach((item, i) => {
            item.loop();
            item.draw();
        });
        this.player.loop();
        this.player.draw();
    }

    checkCollision(object, objects = this.tileset){
        var collisionsDict = {
            "solid": [0, []], // Remember the word "solid" from when you created a brick? This references that!
            "allBricks": [0, []], // Each entry stores an array containing a number (the number of things in it) and another array, the things themselves.
            "allPlayers": [0, []], // Every player in the collision. Above is every block.
            "all": [0, []] // Everything.
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
}


// Demo
var game = new Game(50, 50);

game.create(-2, 4, 6, 1, "normal", "solid");
game.create(-2, 3, 1, 1, "normal", "solid");
game.create(3, 3, 1, 1, "normal", "solid");

function mainloop(){
    game.loop();
    window.requestAnimationFrame(mainloop);
}
window.requestAnimationFrame(mainloop);
