import { until } from '../component/until';
import { Ø } from '../utils/const'

export class ManagerApi {
    private emitter: Function;

    constructor(emitter: Function) {
        this.emitter = emitter;
    }

    public until(untilFunction: Function, max?: number) {
        max = Number(max) || 0;
        until.apply(Ø, [untilFunction, this.emitter, max]);
        // return this.context;
    }
}