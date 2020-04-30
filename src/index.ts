/** 
 * 异步流程管理、调度
 * @description
 *  - instance.until
 *      - 如果设置了最大的尝试次数，程序会自动处理执行次数上限（执行错误钩子<catch>）
 *      - 开发者无需在代码内部再关注执行次数
 *  - instance.then
 *      - 主函数执行成功后执行
 *      - 如果.then后面跟的还是.then，将会按照Promise的流程一直继续下去
 *  - instance.catch
 *      - 主流程发生错误或函数发生错误时执行
 *      - 这里和Promise的流程不同的地方是，一个主函数对应着一个catch，下个主函数的catch不会触发上个主函数的error
 * @todos
 *  - instance.registFunction
 *      - 注册一个函数，使其可以在主函数与回调函数中通过this.fns.xxx调用
 */

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

    public until(callback: Function, max?: number) {
        return this.pushTask('until', callback, max);
    }

    private pushTask(type: string, callback: Function, ...args: any[]) {
        // 暂时不支持函数以外的值传入
        if (typeof callback !== 'function') return this;

        const { queue, apiManager } = this;

        const isMainFunction: boolean = queue.isMainFunction(type);

        // 当前只有主函数和回调函数两种
        // 回调函数执行后表示状态结束 可以开始下一个主函数的调用
        const newStatus: string = isMainFunction ? 'pending' : 'normal';

        queue.add({
            type,
            call: (...cbArgs: any[]) => {
                const ret = isMainFunction ? apiManager[type](callback, ...args) : callback.apply(Ø, cbArgs);
                this.status = newStatus;
                return ret;
            }
        })

        // 如果当前没有在执行的主函数则立即开始一个主函数
        isMainFunction && (this.status === 'normal') && queue.callMainFunction();

        return this;
    }
}