import { RequestMessage, PuzzleStartResponse } from "./model/index"
import { PuzzleGame } from "./service/puzzle"

chrome.runtime.onMessage.addListener((message: RequestMessage, sender, sendResponse: (resopnse: PuzzleStartResponse) => any) => {
    if (message.type == "PuzzleStart") {
        startPuzzle(message.imageUrl, message.column, message.row);
        sendResponse({
            type: "PuzzleStart",
            success: true
        })
    } else {
        sendResponse({
            type: "PuzzleStart",
            success: false
        })
    }
    return true;
})

let puzzle: PuzzleGame;

async function startPuzzle(imageUrl: string, column: number, row: number) {
    initPuzzle(imageUrl, column, row);
    const countDown = document.createElement("div");
    countDown.className = "count-down";
    document.body.appendChild(countDown);
    countDown.innerText = "3";
    await delay(1000);
    countDown.innerText = "2";
    await delay(1000);
    countDown.innerText = "1";
    await delay(1000);
    countDown.remove();
    puzzle.startGame();
}

function delay(ms: number): Promise<any> {
    return new Promise(resolve => {
        setTimeout(() => resolve(void 0), ms);
    })
}

async function initPuzzle(imageUrl: string, column: number, row: number) {
    document.body.remove();
    document.body = document.createElement("body");
    const div = document.createElement("div");
    div.className = "puzzle-container";
    document.body.appendChild(div);
    puzzle = new PuzzleGame(div, imageUrl);
    puzzle.initGame(column, row);
}