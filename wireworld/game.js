let canvas;
const colors = [ "black", "#ff0", "#770", "#333" ];

let circuit;
const [circuitX,     circuitY]      = [ 0, 0];
const [circuitWidth, circuitHeight] = [22, 17];
const circuitScale = 16;

const [ VOID, HEAD, TAIL, WIRE ] = [ 0, 1, 2, 3 ];
const [ UP, DOWN, LEFT, RIGHT ] = [ 0, 1, 2, 3 ];

class Circuit {
    constructor() {
        this.circuit = [];
        this.elements = [];
        let i, j;
        for(i=0; i<circuitHeight; i++) {
            this.circuit[i] = [];
            for(j=0; j<circuitWidth; j++) {
                this.circuit[i][j] = VOID;
            }
        }

        this.steps = 0;
        this.delay = 50;
    }

    get stepsCount() {
        return this.steps;
    }

    getArray() { return this.circuit; }

    get(x, y) {
        if(this.circuit[y]    === undefined) return 0;
        if(this.circuit[y][x] === undefined) return 0;
        return this.circuit[y][x];
    }

    set(x, y, value) {
        this.circuit[y][x] = value;
    }

    add(element, properties) {
        switch(element) {
            case "blueprint": {
                let {x, y, blueprint} = properties;
                for(let i=0; i<blueprint.length; i++) {
                    for(let j=0; j<blueprint[i].length; j++) {
                        if(!blueprint[i][j]) blueprint[i][j] = VOID;
                        this.set(x+j, y+i, blueprint[i][j]);
                    }
                }
                break;
            }

            case "wire": {
                let {x1, y1, x2, y2} = properties;
                if(x2<x1) [x1, x2] = [x2, x1];
                if(y2<y1) [y1, y2] = [y2, y1];

                let [w, h] = [x2-x1, y2-y1];

                stroke(colors[WIRE]);
                for(let i=0; i<=w; i++) {
                    this.set(x1+i, y1 + Math.round(h * (i/w)), WIRE);
                }
                break;
            }

            case "or": {
                let {x, y} = properties;
                this.add("blueprint", {x: x-2, y: y-2, blueprint: [
                    [ , 3, 3,  ,  ],
                    [3,  ,  , 3,  ],
                    [ ,  , 3, 3, 3],
                    [3,  ,  , 3,  ],
                    [ , 3, 3,  ,  ]
                ]});

                break;
            }
        }

        this.draw();
    }

    getNeighbours(x, y, value) {
        let i, j, n = 0;
        for(i=y-1; i<=y+1; i++) {
            for(j=x-1; j<=x+1; j++) {
                if(i==y && j==x) continue;
                if(this.get(j, i) == value) n++;
            }
        }

        return n;
    }

    step() {
        let tempCircuit = new Circuit();

        let x, y;
        for(y=0; y<circuitHeight; y++) {
            for(x=0; x<circuitWidth; x++) {
                switch(this.get(x, y)) {
                    case VOID:
                        tempCircuit.set(x, y, VOID);
                        break;

                    case HEAD:
                        tempCircuit.set(x, y, TAIL);
                        break;

                    case TAIL:
                        tempCircuit.set(x, y, WIRE);
                        break;

                    case WIRE:
                        let n = this.getNeighbours(x, y, HEAD);
                        tempCircuit.set(x, y, (n == 1 || n == 2) ? HEAD : WIRE);
                        break;

                    default:
                        console.error("Unidentified value!");
                }
            }
        }

        let i;
        for(i=0; i<circuitHeight; i++) {
            this.circuit[i] = tempCircuit.getArray()[i].slice();
        }

        this.draw();
        this.steps++;

        if(this.running) setTimeout(() => this.step(), this.delay);
    }

    start() {
        this.running = true;
        this.step();
    }

    stop() {
        this.running = false;
    }

    draw() {
        let x, y;
        for(x=0; x<circuitWidth; x++) {
            for(y=0; y<circuitHeight; y++) {
                stroke(colors[this.get(x, y)]);
                point(x, y);
            }
        }
    }

    /*redraw() {
        let x, y;
        for(x=0; x<circuitWidth; x++) {
            for(y=0; y<circuitHeight; y++) {
                if(this.get(x, y) == WIRE || this.get(x, y) == TAIL) stroke("rgba(255, 255, 255, 0.5)"); else
                if(this.get(x, y) == HEAD) stroke(colors[HEAD]); else continue;
                point(x, y);
            }
        }
    }*/
}

function setup() {
    canvas = createCanvas(circuitWidth, circuitHeight);
    canvas.canvas.style.width  = canvas.width*circuitScale+"px";
    canvas.canvas.style.height = canvas.height*circuitScale+"px";
    noSmooth();

    circuit = new Circuit();

    circuit.add("or", {x: 11, y: 5 });
    circuit.add("or", {x: 11, y: 11});
    circuit.add("or", {x: 16, y: 8});

    circuit.add("blueprint", {x: 14, y: 5, blueprint: [
        [3], [0], [0], [0], [0], [0], [3]
    ]});

    circuit.add("blueprint", {x: 19, y: 2, blueprint: [
        [,3], [,3], [,3], [,3], [,3], [,3], [3,], [,3], [,3], [,3], [,3], [,3], [,3]
    ]});

    circuit.add("blueprint", {x: 8, y: 3, blueprint: [
        [3], [], [], [3], [], [], [], [3], [], [], [3]
    ]});

    circuit.add("blueprint", {x: 1, y:1, blueprint: [
        [ ,2,1,3,3,3],
        [3, , , , , ,3],
        [ ,3,3,3,3,3]
    ]});

    circuit.add("blueprint", {x: 1, y:5, blueprint: [
        [ ,3,3,3,2,1],
        [3, , , , , ,3],
        [ ,3,3,3,3,3]
    ]});

    circuit.add("blueprint", {x: 1, y:9, blueprint: [
        [ ,3,3,3,3,3],
        [3, , , , , ,3],
        [ ,3,3,3,1,2]
    ]});

    circuit.add("blueprint", {x: 1, y:13, blueprint: [
        [ ,3,3,3,3,3],
        [3, , , , , ,3],
        [ ,1,2,3,3,3]
    ]});
}