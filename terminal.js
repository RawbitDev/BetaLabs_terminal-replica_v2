class Terminal {
    static init() {
        Terminal.contentNode = document.getElementById("terminalContent");
        Terminal.cursorNode = document.getElementById("terminalCursor");
        Terminal.inputNode = document.getElementById("terminalInput");
        Terminal.bufferNode = document.getElementById("terminalBuffer");
        Terminal.history = new Array("");
        Terminal.historyPos = 0;
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

        Terminal.println("As with many techniques in JavaScript, it’s mainly a matter of taste when deciding which one to use. However, be aware of the speed impacts of the string-to-array conversion as well as the compatibility issues of the bracket notation.");
        Terminal.println("Hallo mein Name ist Test");
    }

    static rawPrint(text) {
        let node = document.createElement("span");
        let textnode = document.createTextNode(text);
        node.appendChild(textnode);
        Terminal.contentNode.insertBefore(node, Terminal.bufferNode);
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

    static sleep(sec) {
        return new Promise(resolve => setTimeout(resolve, sec * 1000)); //Wait x seconds
    }

    static print(text) {
        let textBuffer = "";
        for (let i = 0; i < text.length; ++i) {
            let c = text.charAt(i);
            if (c === '\n') {
                Terminal.rawPrint(textBuffer);
                textBuffer = "";
                Terminal.newLine();
            }
            else {
                textBuffer += c;
            }
        }
        if (textBuffer !== "") {
            Terminal.rawPrint(textBuffer);
        }
        Terminal.updateScrollPos();
    };

    static println(text) {
        Terminal.print(text + '\n');
    };

    static execute(input) {
        console.log("Terminal.execute(\"" + input + "\");");
    }

}
