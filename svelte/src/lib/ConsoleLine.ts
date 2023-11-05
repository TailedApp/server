export class ConsoleLine {
    id: number;
    content: string;
    cursorPosition: number;

    constructor(id: number, content: string) {
        this.id = id;
        this.content = content;
        this.cursorPosition = 0;
    }

    appendText(text: string) {
        let match = text.match(/^\x1b\[([0-9]+)g$/i);

        if (match && match.length == 2) {
            this.cursorPosition = parseInt(match[1]) - 1;
            return;
        }

        match = text.toUpperCase().match(/^\x1b\[([0-9]*[JK])$/);

        if (match && match.length == 2) {
            switch (match[1]) {
                case 'J':
                case '0J':
                    this.removeAfterCursor();
                    break;
                case '1J':
                    this.removeBeforeCursor();
                    break;
                case '2J':
                case '3J':
                    this.removeLine();
                    break;
                case 'K':
                case '0K':
                    this.removeAfterCursor();
                    break;
                case '1K':
                    this.removeBeforeCursor();
                    break;
                case '2K':
                    this.removeLine();
                    break;
            }
            return;
        }

        this.content += text;
        this.cursorPosition = this.content.length;
    }

    private removeAfterCursor() {
        // Don't remove anything if there's a linebreak after the cursor position.
        if (this.content.substring(this.cursorPosition).indexOf('\n') >= 0)
            return;

        this.content = this.content.substring(0, this.cursorPosition);
    }

    private removeBeforeCursor() {
        this.content = this.content.substring(this.cursorPosition);
    }

    private removeLine() {
        if (this.content.substring(0, 1) == '\n') {
            this.content = '\n';
        } else {
            this.content = '';
        }
    }
}