import { until } from '../component/until';
import { Ø } from '../utils/const'

export class ManagerApi {
    private processEmitter: Function;
    private timeout: number;

    constructor(processEmitter: Function, timeout?: number) {
        this.processEmitter = processEmitter;
        this.timeout = Number(timeout) || 0;
    }

    public until(untilFunction: Function, max?: number) {
        const { processEmitter, timeout } = this;

        max = Number(max) || 0;
        until.apply(Ø, [untilFunction, processEmitter, max, timeout]);
        // return this.context;
    }
}