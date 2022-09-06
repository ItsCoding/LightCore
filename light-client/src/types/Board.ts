import { Composition } from "./Composition"

export type BoardElement = {
    data: Composition
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
        newElements[key] = {
            data: Composition.fromJSON(elements[key].data)
        }
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