export interface Listeners {
    [key: string]: Function[];
}

export interface EventEmitter {
    on(type: string, func: Function): void;
    once(type: string, func: Function): void;
    off(type: string, func: Function): void;
    emit(type: string, ...args: any[]): void;
}