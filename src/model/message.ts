
export interface PuzzleStartRequest {
    type: "PuzzleStart";
    imageUrl: string;
    column: number;
    row: number;
}

export interface CapturePageRequest {
    type: "CapturePage";
    tabId: number;
    windowId: number;
}

export type RequestMessage = PuzzleStartRequest | CapturePageRequest;

export interface PuzzleStartResponse {
    type: "PuzzleStart";
    success: boolean;
}

export interface CapturePageResponse {
    type: "CapturePage";
    imageUrl?: string;
    success: boolean;
}

export type MessageResponse = PuzzleStartRequest | CapturePageRequest;
