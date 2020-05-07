import { Listeners } from "../../types";

export class EventEmitter {
    private listeners: Listeners = {};

    public on(type: string, func: Function) {
        let listeners: Function[] = this.listeners[type];

        if (!this.listeners[type]) {
            listeners = this.listeners[type] = [];
        }

        listeners.push(func);
    }

    public once(type: string, func: Function) {
        const realFn: Function = (...args: any[]) => {
            this.off(type, realFn);
            func(...args);
        }

        this.on(type, realFn);
    }

    public off(type: string, func: Function) {
        const cbs: Function[] = this.listeners[type];

        if (cbs) {
            const index = cbs.indexOf(func);
            
            if (index > -1) {
                cbs.splice(index, 1);
            }
        }
    }

    public emit(type: string, ...args: any[]) {
        const cbs: Function[] = this.listeners[type] || [];

        cbs.forEach((cb: Function) => {
            cb(...args);
        })
    }
}