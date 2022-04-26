class PhysicsObject{
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    loop(){

    }

    move(xm, ym){
        this.x += xm;
        this.y += ym;
    }
}


class Brick extends PhysicsObject{
    constructor(game, x, y, width, height, style, type){
        super(x, y, width, height);
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
    constructor(x, y, width, height){
        super(x, y, width, height);
        this.element = document.createElement("div");
        document.getElementById("game").appendChild(this.element);
        this.element.classList.add("player");
        this.draw();
    }

    draw(){
        this.element.style.left = (window.innerWidth - this.width) / 2 + "px";
        this.element.style.top = (window.innerHeight - this.height) / 2 + "px";
        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
    }
}


class Game {
    constructor(blockWidth, blockHeight){
        this.blockWidth = blockWidth;
        this.blockHeight = blockHeight;
        this.tileset = [];
        this.player = new Player(50, 0, this.blockWidth, this.blockHeight * 2); // Players are usually 1x2 blocks. Feel free to change as you wish.
    }

    _create(x, y, width, height, style, type){
        var b = new Brick(this, x, y, width, height, style, type); // Put it in a variable so we can return it later
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
}


// Demo
var game = new Game(50, 50);
var brick = game.create(0, 0, 1, 1, "normal", "solid");


function mainloop(){
    brick.move(1, 0);
    game.loop();
    window.requestAnimationFrame(mainloop);
}
window.requestAnimationFrame(mainloop);
