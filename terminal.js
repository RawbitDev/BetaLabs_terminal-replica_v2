class Terminal {
	
	//General settings
	static header = "BetaLabsOS [Version 2.0.3] (c) 2020 RawbitDev";
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
            Terminal.cursorEvent = setInterval(function() {
                Terminal.cursorNode.hidden = !Terminal.cursorNode.hidden;
            }, 500);
        });
        this.inputNode.addEventListener("input", function() {
            Terminal.updateBuffer();
        });
        this.inputNode.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) { // Return
                let cmd = Terminal.inputNode.value;
                Terminal.println(cmd);
                if(Terminal.history[Terminal.history.length-1] !== cmd) {
                    Terminal.history.push(cmd);
                }
                Terminal.historyPos = Terminal.history.length;
                Terminal.inputNode.value = "";
                Terminal.bufferNode.innerHTML = "";
                Terminal.execute(cmd);
            } else if (Terminal.history.length > 1 && (event.keyCode === 38 || event.keyCode === 40)) {
                if (event.keyCode === 38 && Terminal.historyPos > 1) { // Arrow key up
                    Terminal.inputNode.value = Terminal.history[--Terminal.historyPos];
                } else if (event.keyCode === 40 && Terminal.historyPos < Terminal.history.length) { // Arrow key down
                    if(Terminal.historyPos === Terminal.history.length-1) {
                        Terminal.inputNode.value = Terminal.history[0];
                        Terminal.historyPos = Terminal.history.length;
                    } else {
                        Terminal.inputNode.value = Terminal.history[++Terminal.historyPos];
                    }
                }
                Terminal.updateBuffer();
            }
        });
        this.inputNode.addEventListener("blur", function() {
            clearInterval(Terminal.cursorEvent);
            Terminal.cursorNode.hidden = false;
        });
        document.getElementById("terminalWindow").addEventListener("click", function() {
            Terminal.inputNode.focus();
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
        try {
            while (node.tagName.toLowerCase() !== "span") {
                node = node.previousSibling;
            }
            node.textContent = text.replace(/ /g, "\u00A0");
        } catch (ignore) {}
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
	    let nodes = this.contentNode.childNodes;
        for (let i = nodes.length-1; i >= 0; --i) {
            if(nodes[i].nodeType !== 3) {
                let tag = nodes[i].tagName.toLowerCase();
                if((tag === "span" && !nodes[i].id) || tag === "br") {
                    this.contentNode.removeChild(nodes[i]);
                }
            }
        }
    }

    static execute(input) {
        try {
            console.log("Terminal.execute(\"" + input + "\");");
            //To be continued...
        } catch (e) {
            this.println("ERROR: " + e.message + "!");
        } finally {
            this.print(this.prefix);
        }
    }
	
	//Output the startup message
	static async startup() {
        this.lockInput();
        this.print("Starting.");
        await this.sleep(500);
        this.reprint("Starting..");
        await this.sleep(500);
        this.reprint("Starting...");
        await this.sleep(500);
        this.clear();
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
        this.newLine();
		await this.sleep(1000);
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
            await this.sleep(15);
        }
        this.reprint("Done!");
        await this.sleep(1000);
        this.reprint(this.prefix);
        this.unlockInput();
	}

	static redButton() {
        //TODO
    }

    static yellowButton() {
        if(!this.locks) {
            this.clear();
            this.print(this.prefix);
        }
    }

    static greenButton() {
        //TODO
    }

}
