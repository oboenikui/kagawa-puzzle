import { RequestMessage } from "./model/index";
chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [
            new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostContains: 'kagawa.lg.jp' },
            })
        ],
        actions: [
            new chrome.declarativeContent.ShowPageAction()
        ]
    }]);
});

function onCaptureResponse(dataUrl?: string) {
    this.sendResponse({
        type: "CapturePage",
        imageUrl: dataUrl,
        success: true
    });
}

chrome.runtime.onMessage.addListener((message: RequestMessage, sender, sendResponse) => {
    console.log(message);
    if (message.type == "CapturePage") {
        chrome.tabs.captureVisibleTab(
            message.windowId,
            { format: "png" },
            onCaptureResponse.bind({ sendResponse })
        );
    }
    return true;
})