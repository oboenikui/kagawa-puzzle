import { toPromise } from "../util/utils";

export class PuzzleGame {
    private container: HTMLDivElement;

    initialImageUrl: string;

    private board: Board;

    private lockPieces: boolean = false;

    constructor(container: HTMLDivElement, initialImageUrl: string) {
        this.container = container;
        container.style.width = window.innerWidth + "px";
        container.style.height = window.innerHeight + "px";
        this.initialImageUrl = initialImageUrl;
    }

    async initGame(column: number, row: number) {
        this.board = new Board(column, row);
        await this.initBoard(this.container);
    }

    private async initBoard(container: HTMLDivElement) {
        const image = new Image();
        image.src = this.initialImageUrl;
        await toPromise(fn => image.addEventListener("load", fn))
        const canvas = document.createElement("canvas");
        const dw = canvas.width = window.innerWidth / this.board.column;
        const dh = canvas.height = window.innerHeight / this.board.row;
        const sw = image.width / this.board.column;
        const sh = image.height / this.board.row;
        const context = canvas.getContext("2d");
        for (let y = 0; y < this.board.row; y++) {
            const row = document.createElement("div");
            row.className = "puzzle-row";
            container.appendChild(row);
            for (let x = 0; x < this.board.column; x++) {
                context.drawImage(image, sw * x, sh * y, sw, sh, 0, 0, dw, dh);
                const newImg = document.createElement("img");
                newImg.setAttribute("draggable", "false");
                newImg.dataset.initialX = x.toString();
                newImg.dataset.initialY = y.toString();
                newImg.dataset.x = x.toString();
                newImg.dataset.y = y.toString();
                if (x === this.board.column - 1 && y === this.board.row - 1) {
                    newImg.className = "hole";
                }
                newImg.addEventListener("click", this.handleOnClick.bind(this, newImg));
                newImg.addEventListener("transitionend", this.handlerOnTransitionEnd.bind(this, newImg));
                row.appendChild(newImg);
                canvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    newImg.onload = function () {
                        URL.revokeObjectURL(url);
                    };
                    newImg.src = url;
                });
            }
        }
    }

    private handleOnClick(img: HTMLImageElement) {

        if (this.lockPieces) return;
        const coordinate = {
            x: parseInt(img.dataset.x),
            y: parseInt(img.dataset.y)
        };
        const canShift = this.board.canShift(coordinate);
        if (!canShift) return;

        this.lockPieces = true;
        const result = this.board.shift(coordinate);
        img.style.transform = `translate(${(result.x - coordinate.x) * img.width}px, ${(result.y - coordinate.y) * img.height}px)`;
    }

    private handlerOnTransitionEnd(img: HTMLImageElement) {
        this.lockPieces = false;
        img.style.transform = "";
        this.apply();
    }

    startGame() {
        this.shuffle();
    }

    private shuffle() {
        this.board.shuffle();
        this.apply();
    }

    private apply() {
        const newRows = [];

        for (let y = 0; y < this.board.row; y++) {
            const row = document.createElement("div");
            row.className = "puzzle-row";
            newRows.push(row);
            for (let x = 0; x < this.board.column; x++) {
                const piece = this.board.getPiece(x, y);
                const img: HTMLElement = this.container.querySelector(
                    `[data-initial-x='${piece.positionX}'][data-initial-y='${piece.positionY}']`);
                img.dataset.x = x.toString();
                img.dataset.y = y.toString();
                img.parentElement.removeChild(img);
                row.appendChild(img);
            }
        }
        this.container.innerHTML = "";
        newRows.forEach(el => {
            this.container.appendChild(el);
        })
        if (this.board.isCompleted()) {
            this.container.classList.add("completed");
            this.lockPieces = true;
        } else {
            this.container.classList.remove("completed");
            this.lockPieces = false;
        }
    }
}

type Coordniate = { x: number, y: number };

class Board {
    column: number;
    row: number;

    private pieces: Piece[];

    private holePiece: Piece;

    constructor(column: number, row: number) {
        this.column = column;
        this.row = row;
        this.pieces = Array.from(new Array(column * row))
            .map((_, index) => new Piece(index % column, Math.floor(index / column)));
        this.holePiece = this.pieces[this.pieces.length - 1];
    }

    reset() {
        this.pieces = this.pieces
            .sort((a, b) =>
                this.toIndex({ x: a.positionX, y: a.positionY }) - this.toIndex({ x: b.positionX, y: b.positionY })
            )
    }

    shuffle(count: number = this.column * this.row * 100) {
        let pieces = this.pieces;
        for (let i = 0; i < count; i++) {
            pieces = this.randomMove(pieces);
        }
        this.pieces = pieces;
    }

    private randomMove(pieces: Piece[]) {
        const hole = this.holeCoordniate(pieces);
        const movablePieces = [
            { x: hole.x - 1, y: hole.y },
            { x: hole.x + 1, y: hole.y },
            { x: hole.x, y: hole.y - 1 },
            { x: hole.x, y: hole.y + 1 },]
            .filter(coordinate => this.isValidCoordinate(coordinate));
        const movePiece = this.randomSelect(movablePieces);
        return this.swap(pieces, hole, movePiece);
    }

    private randomSelect<T>(l: T[]): T {
        return l[l.length * Math.random() | 0];
    }

    private swap(pieces: Piece[], c1: Coordniate, c2: Coordniate): Piece[] {
        const newArray = Array.from(pieces);
        const c1Index = this.toIndex(c1);
        const c2Index = this.toIndex(c2);
        [newArray[c1Index], newArray[c2Index]] = [newArray[c2Index], newArray[c1Index]];
        return newArray;
    }

    private holeCoordniate(pieces: Piece[]): Coordniate {
        const index = pieces.findIndex((p) => this.holePiece == p);
        return this.toCoordniate(index);
    }

    private isValidCoordinate({ x, y }: Coordniate) {
        return x >= 0 && x < this.column && y >= 0 && y < this.row;
    }

    canShift({ x, y }: Coordniate): boolean {
        const index = this.toIndex({ x, y });
        return (this.pieces[index + 1] == this.holePiece && x != this.column - 1) ||
            (this.pieces[index - 1] == this.holePiece && x != 0) ||
            (this.pieces[index + this.column] == this.holePiece && y != this.row - 1) ||
            (this.pieces[index - this.column] == this.holePiece && y != 0);
    }

    shift(coordniate: Coordniate): Coordniate {
        const { x, y } = coordniate;
        if (!this.isValidCoordinate(coordniate) || !this.canShift(coordniate)) {
            throw new Error(`Cannot move (${x}, ${y})`);
        }
        const holeCoordniate = this.holeCoordniate(this.pieces);
        this.pieces = this.swap(this.pieces, coordniate, holeCoordniate);
        return holeCoordniate;
    }

    private toIndex({ x, y }: Coordniate) {
        return x + y * this.column;
    }

    private toCoordniate(index: number) {
        return { x: index % this.column, y: index / this.column | 0 };
    }

    getPiece(x: number, y: number): Piece {
        return this.pieces[this.toIndex({ x, y })];
    }

    isBlank(x: number, y: number): boolean {
        return this.getPiece(x, y) == this.holePiece;
    }

    isCompleted(): boolean {
        return !this.pieces.some((p, index) => p.positionX !== index % this.column || p.positionY !== (index / this.column | 0));
    }
}

class Piece {
    positionX: number;
    positionY: number;

    constructor(positionX: number, positionY: number) {
        this.positionX = positionX;
        this.positionY = positionY;
    }

    toString() {
        return `Piece(${this.positionX}, ${this.positionY})`;
    }
}