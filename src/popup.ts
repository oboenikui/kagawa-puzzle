import { CapturePageRequest, CapturePageResponse, PuzzleStartResponse, PuzzleStartRequest } from "./model/message";
import { toPromise } from "./util/utils";

document.getElementById("start").addEventListener("click", () => main());

async function main() {

    const [tabs] = await toPromise<[chrome.tabs.Tab[]]>((callbackFn) =>
        chrome.tabs.query({ active: true, currentWindow: true }, callbackFn));

    const [tab] = tabs;
    if (tab) {
        const capturePageRequest: CapturePageRequest = {
            type: "CapturePage",
            tabId: tab.id,
            windowId: tab.windowId
        }
        const [captureResponse] = await toPromise<[CapturePageResponse]>(callbackFn =>
            chrome.runtime.sendMessage(capturePageRequest, callbackFn));
        if (!captureResponse.imageUrl) {
            return;
        }
        const column = parseInt((document.getElementById("column") as HTMLInputElement).value);
        const row = parseInt((document.getElementById("row") as HTMLInputElement).value);
        if (Number.isNaN(column) || Number.isNaN(row)) {
            return;
        }
        const puzzleRequest: PuzzleStartRequest = {
            type: "PuzzleStart",
            imageUrl: captureResponse.imageUrl,
            column: column,
            row: row,
        }
        await toPromise<[PuzzleStartResponse]>(callbackFn =>
            chrome.tabs.sendMessage(tab.id, puzzleRequest, callbackFn));
    }
}