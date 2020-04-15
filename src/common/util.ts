
import { Position, TextDocument } from "vscode";
import * as vscode from "vscode";

export class Util {

    /**
     * wrap origin with ` if is unusual identifier
     * @param origin any string
     */
    public static wrap(origin: string) {
        if (origin == null) return origin;

        if (origin.match(/\b[-\.]\b/ig)
            || origin.match(/^if|key|name|user|desc|length$/i)) {
            return `\`${origin}\``;
        }

        return origin;
    }

    /**
     * trim array, got from SO.
     * @param origin origin array
     * @param attr duplicate check attribute
     */
    public static trim<T>(origin: T[], attr: string): T[] {
        const seen = new Set();
        return origin.filter((item) => {
            const temp = item[attr];
            return seen.has(temp) ? false : seen.add(temp);
        });
    }

    public static getDocumentLastPosition(document: TextDocument): Position {
        const lastLine = document.lineCount - 1;
        return new Position(lastLine, document.lineAt(lastLine).text.length);
    }

    public static copyToBoard(content: string) {
        vscode.env.clipboard.writeText(content).then(() => {
            vscode.window.showInformationMessage(`Copy ${content} to clipboard success!`);
        });
    }

}