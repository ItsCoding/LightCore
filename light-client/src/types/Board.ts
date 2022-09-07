import { Composition } from "./Composition"

let allCompositions: Composition[] = [];

export const setAllCompositions = (compositions: Composition[]) => {
    allCompositions = compositions;
}

export class BoardElement {
    public test? = "test";
    // data: Composition
    private _compID?: string;
    constructor(
        data?: Composition
    ){
        if(data){
            this._compID = data.id;
        }
    }
    public set data(value: Composition) {
        this._compID = value.id;
    }
    public get data(): Composition {
        const dt = allCompositions.find(comp => comp.id === this._compID)!;
        return dt!;
    }
}

export type Board = {
    name?: string,
    description?: string,
    id?: string,
    elements: {
        [key: string]: BoardElement,
    }
}

const elementsHelperJson = (elements: {[key: string]: BoardElement}) => {
    const newElements: {[key: string]: any} = {};
    Object.keys(elements).forEach(key => {
        newElements[key] = {
            data: elements[key].data.toJSON()
        }
    });
    return newElements;
}

export const Board2JSON = (board: Board) => {
    return {
        name: board.name,
        description: board.description,
        id: board.id,
        elements: elementsHelperJson(board.elements)
    }
}

const elementsHelperBoard = (elements: {[key: string]: any}) => {
    const newElements: {[key: string]: BoardElement} = {};
    Object.keys(elements).forEach(key => {
        const nEle = new BoardElement(Composition.fromJSON(elements[key].data))
        newElements[key] = nEle;
    });
    return newElements;
}

export const JSON2Board = (json: any) => {
    return {
        name: json.name,
        description: json.description,
        id: json.id,
        elements: elementsHelperBoard(json.elements)
    } as Board;
}