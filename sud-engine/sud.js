class SUD {
    constructor(config) {
        this.input = {
            element: document.getElementById(config.inputId),
            get: () => this.input.element.value,
            clear: () => this.input.element.value = ""
        }

        this.output = {
            element: document.getElementById(config.outputId)
        }

        this.lazyPrinting = config.lazyPrinting || false;
        this.lazyPrintingDelay = config.lazyPrintingDelay || 500;

        this.player = {
            name: config.player.name || "Player",
            color: config.player.color || "white",
            inventory: {
                list: config.player.inventory || {},
                add: (id, desc) => this.inventory.list[id] = desc,
                remove: (id) => delete this.inventory.list[id],
                check: (id) => this.inventory.list[id] !== undefined
            },
            say: (msg) => this.print("<b>" + SUD.color(this.player.color, this.player.name) + "</b>: " + msg),
            think: (msg) => this.print(SUD.color("grey", msg))
        }
        
        this.flag = {
            list: {},
            set: (name) => this.flag.list[name] = true,
            unset: (name) => delete this.flag.list[name],
            check: (name) => !!this.flag.list[name]
        }

        this.delay = {
            last: new Date().getTime(),
            add: (callback) => {
                let now = new Date().getTime();

                if(now > this.delay.last + this.lazyPrintingDelay) {
                    callback();
                    this.delay.last = now;
                }
                else if(now < this.delay.last) {
                    setTimeout(callback, this.delay.last - now + this.lazyPrintingDelay);
                    this.delay.last += this.lazyPrintingDelay;
                }
                else {
                    setTimeout(callback, this.lazyPrintingDelay - (now - this.delay.last));
                    this.delay.last += this.lazyPrintingDelay;
                }
            }
        }

        this.room = {
            list: config.rooms || {},
            current: "start",
            add: (id, r) => this.room.list[id] = r,
            remove: (id) => delete this.room.list[id],
            get: (id) => this.room.list[id || this.room.current],
            change: (id) => {
                this.room.current = this.room.get().exits[id] || id;

                let room = this.room.get();
                this.print(
                    "<b>" + (
                    typeof room.name == "string" ?
                    room.name : room.name(this)
                    ) + "</b>"
                );
                this.print(
                    typeof room.description == "string" ?
                    room.description : room.description(this)
                );
            }
        }

        this.dunnos = config.dunnos || [
            "What?", "Hmmm?"
        ]

        this.exitCommands = config.exitCommands || [
            "enter", "go", "walk", "run", "approach"
        ]

        this.exitIgnoreWords = config.exitIgnoreWords || [
            "the", "a", "an"
        ]

        this.actionIgnoreWords = config.actionIgnoreWords || this.exitIgnoreWords;

        this.command = {
            exec: (cmd) => {
                this.lastCommand = cmd;
                let cmdArray = cmd.split(" ");

                if(cmd === "i" || cmd === "inventory") {
                    let inventory = this.player.inventory.list;
                    for(let i in inventory) {
                        if(!inventory.hasOwnProperty(i)) continue;
                        this.print(inventory[i]);
                    }
                    return;
                }
                
                if(!!this.room.get().actions) {
                    for(let i in this.actionIgnoreWords) {
                        while(cmdArray.indexOf(this.actionIgnoreWords[i]) != -1) {
                            cmdArray.splice(cmdArray.indexOf(this.actionIgnoreWords[i]), 1);
                        }
                    }

                    let actions = this.room.get().actions;
                    for(let i in actions) {
                        if(i == cmdArray.join(" ")) {
                            let action = actions[i];
                            
                            this.print((action.check === undefined || action.check(this)) ? action.text : action.afterText);
                            if((action.check === undefined || action.check(this)) && action.exec) action.exec(this);
                            return; // @TODO
                        }
                    }
                }

                if(this.exitCommands.indexOf(cmdArray[0]) != -1) {
                    for(let i in cmdArray) {
                        if(this.room.get().exits[cmdArray[i]] !== undefined) {
                            this.room.change(cmdArray[i]);
                            return;
                        }
                    }
                }

                this.player.think(
                    this.dunnos[SUD.random(this.dunnos.length)]
                );
            }
        }


        this.output.element.addEventListener("click", () => {
            input.focus();
        });

        this.input.element.addEventListener("change", () => {
            let command = this.input.get();
            this.input.clear()
            this.player.say("*" + command + "*");
            this.command.exec(command);
        });

        this.input.element.value = "";
        this.input.element.focus();
        this.room.change("start");
    }
    

    // output

    static color(color, text) {
        return `<span style="color: ${color}">${text}</span>`
    }

    printNow(msg) {
        let elem = document.createElement("div");
        elem.innerHTML = msg;
        this.output.element.appendChild(elem);
        this.output.element.scrollTo(0, this.output.element.scrollHeight);
    }

    print(msg) {
        if(!this.lazyPrinting) {
            this.printNow(msg);
        } else {
            this.delay.add(() => this.printNow(msg));
        }
    }

    sayNow(author, msg) {
        this.printNow("<b>" + author + "</b>: " + msg);
    }

    say(author, msg) {
        if(!this.lazyPrinting) {
            this.sayNow(author, msg);
        } else {
            this.delay.add(() => this.sayNow(author, msg));
        }
    }


    // misc

    static random(from, to) {
        if(to === undefined) {
            to = from;
            from = 0;
        }

        return Math.floor(Math.random()*(to - from) + from);
    }
}