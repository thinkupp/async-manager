export interface TickPart {
    next?: TickPart;
    then?: Array<Function>;
    catch?: Function;
    main: Function;
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
    callCallback(type: string, data?: any): boolean;
    callMainFunction(): void;
    add(param: AddParam): void;
}