export interface TickPart {
    prev?: TickPart;
    next?: TickPart;
    then?: Array<Function>;
    catch?: Function;
    main: Function;
    type: string;
}

export interface AddParam {
    // 函数名
    type: string;
    // 函数体
    call: Function;
}

export declare class Queue {
    isMainFunction(type: string): boolean;
    isSpecialFunction(type: string): boolean;
    callCallback(type: string, data?: any): void;
    callMainFunction(): void;
    add(param: AddParam): void;
}