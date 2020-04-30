import { Queue } from "../../types";
import { doneFunctionGenerator } from './doneFuncGen';

function createCallWrap(fn: Function, max: number, doneGetter: Function) : Function {
    let count = 0;

    // 如果max为0或不存在则不需要每次对count校验
    if (!max) return function callUntilFunction() {
        fn(count, doneGetter());
    }

    // max大于0时
    // 内部需要在每次执行之前检查一下是否达到上限
    return function callUntilFunction() {
        if (++count > max) {
            throw new Error('retry max');
        }

        fn(count, doneGetter());
    }
}


/**
 * 执行一个函数，成功或失败到上限之前将重复执行
 * @param callback until执行器
 * @param queue 执行链
 * @param max 最大错误次数
 */
export function until(callback: Function, queue: Queue, max: number) {
    const doneGetter = doneFunctionGenerator(queue, 'until')();
    const callUntilFunction = createCallWrap(callback, max, doneGetter)();

    // 推入异步中，使后面的链式注册不影响主函数的执行
    setTimeout(call, 0);

    function call() {
        try {
            callUntilFunction();
        } catch (err) {
            queue.callCallback('catch', err);
        }
    }
}
