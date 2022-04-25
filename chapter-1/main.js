class PhysicsObject{
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}


class Brick extends PhysicsObject{
    constructor(x, y, width, height, style, type){
        super(x, y, width, height);
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
        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";
    }
}


// Demo here!
var brick = new Brick(100, 100, 50, 50, "normal", "solid");
