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

export declare class QueueInterface {
    isMainFunction(type: string): boolean;
    isSpecialFunction(type: string): boolean;
    callCallback(type: string): boolean;
    add(param: AddParam): void;
}