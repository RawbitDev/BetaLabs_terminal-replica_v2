class Terminal {
	
	//General settings
	static header = "BetaLabsOS [Version 2.0.1] (c) 2020 MrRawbit";
	static prefix = "root@BetaLabs.io:~# ";
	
    static async init() {
        this.contentNode = document.getElementById("terminalContent");
        this.cursorNode = document.getElementById("terminalCursor");
        this.inputNode = document.getElementById("terminalInput");
        this.bufferNode = document.getElementById("terminalBuffer");
        this.history = new Array("");
        this.historyPos = 0;
        this.locks = 0;
        this.registerEvents();
        this.inputNode.focus();
        await this.startup();
    }

    static registerEvents() {
        this.inputNode.addEventListener("focus", function() {
            this.cursorEvent = setInterval(function() {
                this.cursorNode.hidden = !this.cursorNode.hidden;
            }, 500);
        });
        this.inputNode.addEventListener("input", function() {
            Terminal.updateBuffer();
        });
        this.inputNode.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) { // Return
                let cmd = this.inputNode.value;
                Terminal.println(cmd);
                if(this.history[this.history.length-1] !== cmd) {
                    this.history.push(cmd);
                }
                this.historyPos = this.history.length;
                this.inputNode.value = "";
                this.bufferNode.innerHTML = "";
                Terminal.execute(cmd);
            } else if (this.history.length > 1 && (event.keyCode === 38 || event.keyCode === 40)) {
                if (event.keyCode === 38 && this.historyPos > 1) { // Arrow key up
                    this.inputNode.value = this.history[--this.historyPos];
                } else if (event.keyCode === 40 && this.historyPos < this.history.length) { // Arrow key down
                    if(this.historyPos === this.history.length-1) {
                        this.inputNode.value = this.history[0];
                        this.historyPos = this.history.length;
                    } else {
                        this.inputNode.value = this.history[++this.historyPos];
                    }
                }
                Terminal.updateBuffer();
            }
        });
        this.inputNode.addEventListener("blur", function() {
            clearInterval(this.cursorEvent);
            this.cursorNode.hidden = false;
        });
        document.getElementById("terminalWindow").addEventListener("click", function() {
            this.inputNode.focus();
        });
    }

    static rawPrint(text) {
        let node = document.createElement("span");
        let textNode = document.createTextNode(text.replace(/ /g, "\u00A0"));
        node.appendChild(textNode);
        this.contentNode.insertBefore(node, this.bufferNode);
    };

    static rawReprint(text) {
        let node = this.bufferNode.previousSibling;
        while(node.tagName.toLowerCase() !== 'span') {
            node = node.previousSibling;
        }
        node.textContent = text.replace(/ /g, "\u00A0");
    };

    static updateBuffer() {
        this.bufferNode.innerHTML = "";
        this.bufferNode.appendChild(document.createTextNode(this.inputNode.value));
        this.inputNode.focus();
    }

    static newLine() {
        let node = document.createElement("br");
        this.contentNode.insertBefore(node, this.bufferNode);
    };

    static updateScrollPos() {
        this.contentNode.scrollTop = this.contentNode.scrollHeight;
    };

    static lockInput() {
        ++this.locks;
        if(this.locks) {
            this.inputNode.disabled = true;
        }
    };

    static unlockInput() {
        --this.locks;
        if(!this.locks) {
            this.inputNode.disabled = false;
            this.inputNode.focus();
        }
    };

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms)); //Wait x millis
    }

    static print(text) {
        let textBuffer = "";
		for (let c of text) {
            if (c === '\n') {
                this.rawPrint(textBuffer);
                textBuffer = "";
                this.newLine();
            } else {
                textBuffer += c;	
            }
        }
        if (textBuffer !== "") {
            this.rawPrint(textBuffer);
        }
        this.updateScrollPos();
    };

    static reprint(text) {
        let textBuffer = "";
        for (let i = 0; i < text.length; ++i) {
            let c = text.charAt(i);
            if (c === '\n') {
                this.rawReprint(textBuffer);
                this.newLine();
                let remainingText = text.substring(i+1);
                if (remainingText !== "") {
                    this.print(textBuffer);
                }
            } else {
                textBuffer += c;
            }
        }
        if (textBuffer !== "") {
            this.rawReprint(textBuffer);
        }
        this.updateScrollPos();
    };
	
	static async write(text) {
        this.lockInput();
        for (let i = 0; i < text.length; ++i) {
            let out = text.substring(0, i+1);
            if(!i) {
                this.print(out);
            } else {
                this.reprint(out);
            }
			await this.sleep(25);
		}
        this.unlockInput();
	}

    static println(text) {
        this.print(text + '\n');
    };
	
	static async writeln(text) {
        await this.write(text + '\n');
    };

	static clear() {

    }

    static execute(input) {
        console.log("Terminal.execute(\"" + input + "\");");
        this.print(this.prefix);
    }
	
	//Output the startup message
	static async startup() {
        this.lockInput();
        this.print("Initializing... [0%");
        for (let i = 0; i <= 100; ++i) {
            let progress = "";
            for (let j = 0; j < 20; ++j) {
                if(j < (i/5)) {
                    progress += "=";
                } else {
                    if(progress.endsWith("=")) {
                        progress += ">";
                    }
                    progress += " ";
                }
            }
            this.reprint("Initializing... [" + progress + "] (" + i + "%)");
            await this.sleep(10);
        }
        this.reprint("Starting.");
        await this.sleep(500);
        this.reprint("Starting..");
        await this.sleep(500);
        this.reprint("Starting...");
        await this.sleep(500);
        this.reprint(" ");
        await this.write(this.header);
        await this.sleep(1000);
        this.newLine();
        this.println("  ____       _        _           _           _       ");
		await this.sleep(200);
        this.println(" |  _ \\     | |      | |         | |         (_)      ");
        await this.sleep(200);
        this.println(" | |_) | ___| |_ __ _| |     __ _| |__  ___   _  ___  ");
        await this.sleep(200);
        this.println(" |  _ < / _ \\ __/ _` | |    / _` | '_ \\/ __| | |/ _ \\ ");
        await this.sleep(200);
        this.println(" | |_) |  __/ || (_| | |___| (_| | |_) \\__ \\_| | (_) |");
        await this.sleep(200);
        this.println(" |____/ \\___|\\__\\__,_|______\\__,_|_.__/|___(_)_|\\___/ ");
		await this.sleep(1000);
        this.newLine();
        this.unlockInput();
        this.print(this.prefix);
	}

}
