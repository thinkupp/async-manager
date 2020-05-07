import { doneFunctionGenerator } from './doneFuncGen';

function createCallWrap(fn: Function, max: number, doneGetter: Function, timeout: number) : Function {
    let count = 0;

    return function callWrap() {
        count++;
        if (max > 0 && count > max) {
            // max大于0时
            // 内部需要在每次执行之前检查一下是否达到上限
            throw new Error('retry max');
        }

        const ctrl = doneGetter(callWrap);
        ctrl.timeout(timeout);
        fn(ctrl, count);
    }
}


/**
 * 执行一个函数，成功或失败到上限之前将重复执行
 * @param callback until执行器
 * @param processEmitter 事件发生器
 * @param max 最大错误次数
 * @param timeout 超时时间
 */
export function until(callback: Function, processEmitter: Function, max: number, timeout: number) {
    const doneGetter = doneFunctionGenerator(processEmitter, 'until');

    const callUntilFunction = createCallWrap(callback, max, doneGetter, timeout);

    // 推入异步中，使后面的链式注册不影响主函数的执行
    setTimeout(call, 0);

    function call() {
        try {
            callUntilFunction();
        } catch (err) {
            processEmitter('error', err);
        }
    }
}
