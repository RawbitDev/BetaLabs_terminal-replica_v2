class Terminal {
	
	//General settings
	static header = "BetaLabsOS [Version 2.0.1] (c) 2020 MrRawbit";
	static prefix = "root@BetaLabs.io:~#";
	static startupPath = "./startup.txt";
	
    static init() {
        Terminal.contentNode = document.getElementById("terminalContent");
        Terminal.cursorNode = document.getElementById("terminalCursor");
        Terminal.inputNode = document.getElementById("terminalInput");
        Terminal.bufferNode = document.getElementById("terminalBuffer");
        Terminal.history = new Array("");
        Terminal.historyPos = 0;
        Terminal.locks = 0;
        Terminal.inputNode.addEventListener("focus", function() {
            Terminal.cursorEvent = setInterval(function() { 
                if(Terminal.cursorNode.hidden) {
                    Terminal.cursorNode.hidden = false;
                } else {
                    Terminal.cursorNode.hidden = true;
                }
            }, 500);
        });
        Terminal.inputNode.addEventListener("input", function() {
            Terminal.updateBuffer();
        });
        Terminal.inputNode.addEventListener("keyup", function(event) {
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
        Terminal.inputNode.addEventListener("blur", function() {
            clearInterval(Terminal.cursorEvent);
            Terminal.cursorNode.hidden = false;
        });
        document.getElementById("terminalWindow").addEventListener("click", function() {
            Terminal.inputNode.focus();
        });
        Terminal.inputNode.focus();
		//Boot
		Terminal.startup();
    }

    static rawPrint(text) {
        let node = document.createElement("span");
        let textNode = document.createTextNode(text);
        node.appendChild(textNode);
        Terminal.contentNode.insertBefore(node, Terminal.bufferNode);
    };

    static rawReprint(text) {
        let node = Terminal.bufferNode.previousSibling;
        while(node.tagName.toLowerCase() !== 'span') {
            node = node.previousSibling;
        }
        node.textContent = text;
    };

    static updateBuffer() {
        Terminal.bufferNode.innerHTML = "";
        Terminal.bufferNode.appendChild(document.createTextNode(Terminal.inputNode.value));
        Terminal.inputNode.focus();
    }

    static newLine() {
        let node = document.createElement("br");
        Terminal.contentNode.insertBefore(node, Terminal.bufferNode);
    };

    static updateScrollPos() {
        Terminal.contentNode.scrollTop = Terminal.contentNode.scrollHeight;
    };

    static lockInput() {
        ++Terminal.locks;
        if(Terminal.locks) {
            Terminal.inputNode.disabled = true;
        }
    };

    static unlockInput() {
        --Terminal.locks;
        if(!Terminal.locks) {
            Terminal.inputNode.disabled = false;
            Terminal.inputNode.focus();
        }
    };

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms)); //Wait x millis
    }

    static print(text) {
        let textBuffer = "";
		for (let c of text) {
            if (c === '\n') {
                Terminal.rawPrint(textBuffer);
                textBuffer = "";
                Terminal.newLine();
            } else {
                textBuffer += c;	
            }
        }
        if (textBuffer !== "") {
            Terminal.rawPrint(textBuffer);
        }
        Terminal.updateScrollPos();
    };

    static reprint(text) {
        let textBuffer = "";
        for (let i = 0; i < text.length; ++i) {
            let c = text.charAt(i);
            if (c === '\n') {
                Terminal.rawReprint(textBuffer);
                Terminal.newLine();
                let remainingText = text.substring(i+1);
                if (remainingText !== "") {
                    Terminal.print(textBuffer);
                }
            } else {
                textBuffer += c;
            }
        }
        if (textBuffer !== "") {
            Terminal.rawReprint(textBuffer);
        }
        Terminal.updateScrollPos();
    };
	
	static async write(text) {
        Terminal.lockInput();
        for (let i = 0; i < text.length; ++i) {
            let out = text.substring(0, i+1);
            if(!i) {
                Terminal.print(out);
            } else {
                Terminal.reprint(out);
            }
			await Terminal.sleep(25);
		}
        Terminal.unlockInput();
	}

    static println(text) {
        Terminal.print(text + '\n');
    };
	
	static async writeln(text) {
        await Terminal.write(text + '\n');
    };

    static execute(input) {
        console.log("Terminal.execute(\"" + input + "\");");
    }
	
	//Output the startup message
	static async startup() {
        Terminal.lockInput();
        Terminal.print("Initializing... [0%");
        for (let i = 0; i <= 100; ++i) {
            let progress = "";
            for (let j = 0; j < 20; ++j) {
                if(j < (i/5)) {
                    progress += "=";
                } else {
                    if(progress.endsWith("=")) {
                        progress += ">";
                    }
                    progress += "\u00A0";
                }
            }
            Terminal.reprint("Initializing... [" + progress + "] (" + i + "%)");
            await Terminal.sleep(15);
        }
        Terminal.reprint("Starting.");
        await Terminal.sleep(500);
        Terminal.reprint("Starting..");
        await Terminal.sleep(500);
        Terminal.reprint("Starting...");
        await Terminal.sleep(500);
        Terminal.reprint(" ");
        await Terminal.write(Terminal.header);
        await Terminal.sleep(1000);
        Terminal.newLine();
		/*
		let fileData = Terminal.loadFile(Terminal.startupPath); //Get content of the startup file
		var lines = fileData.split('\n'); //Split it in its lines
		for (var line=0; line<lines.length; line++) { //Print every line by line with a delay between them
			Terminal.println(lines[line]);
			await Terminal.sleep(200);
		}
		await Terminal.sleep(1000);
		*/
        Terminal.unlockInput();
	}
	//Read a linked file
	static loadFile(filePath) {
		var result = null;
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET", filePath, false);
		xmlhttp.send();
		if (xmlhttp.status === 200) {
			result = xmlhttp.responseText;
		}
		return result;
	}

}
