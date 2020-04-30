import { Queue } from '../../types';
import { until } from '../component/until';
import { Ø } from '../utils/const'

export default class ManagerApi {
    private context: any;
    private queue: Queue;

    constructor(context: any, queue: Queue) {
        this.context = context;
        this.queue = queue;
    }

    public until(untilFunction: Function, max?: number) {
        max = Number(max) || 0;
        until.apply(Ø, [untilFunction, this.queue, max]);
        return this.context;
    }
}