import { until } from '../component/until';
import { Ø } from '../utils/const'

export class ManagerApi {
    private processEmitter: Function;

    constructor(processEmitter: Function) {
        this.processEmitter = processEmitter;
    }

    public until(untilFunction: Function, max?: number) {
        max = Number(max) || 0;
        until.apply(Ø, [untilFunction, this.processEmitter, max]);
        // return this.context;
    }
}