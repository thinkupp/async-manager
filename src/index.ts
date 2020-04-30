import { Queue, ManagerApi } from './module/index';
import { Ø } from './utils/const'

export class AsyncManager {
    private status: string = 'normal';
    private queue: Queue = new Queue;
    private apiManager: ManagerApi;

    constructor() {
        this.apiManager = new ManagerApi(this ,this.queue);
    }

    public then(callback: Function) {
        return this.pushTask('success', callback);
    }

    public catch(callback: Function) {
        return this.pushTask('catch', callback);
    }

    public until(callback: Function) {
        return this.pushTask('until', callback);
    }

    private pushTask(type: string, callback: Function, ...args: any[]) {
        // 暂时不支持函数以外的值传入
        if (typeof callback !== 'function') return;

        const { queue, apiManager } = this;

        const isMainFunction: boolean = queue.isMainFunction(type);

        // 当前只有主函数和回调函数两种
        // 回调函数执行后表示状态结束 可以开始下一个主函数的调用
        const newStatus: string = isMainFunction ? 'pending' : 'normal';

        queue.add({
            type,
            call: (...cbArgs: any[]) => {
                const ret = isMainFunction ? apiManager[type].apply(Ø, [callback, ...args]) : callback.apply(Ø, cbArgs);
                this.status = newStatus;
                return ret;
            }
        })

        // 如果当前没有在执行的主函数则立即开始一个主函数
        isMainFunction && (this.status === 'normal') && queue.callMainFunction();

        return this;
    }
}