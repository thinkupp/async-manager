import { doneFunctionGenerator } from './doneFuncGen';

function createCallWrap(fn: Function, max: number, doneGetter: Function) : Function {
    let count = 0;

    // 如果max为0或不存在则不需要每次对count校验
    if (!max) return function callUntilFunction() {
        fn(doneGetter(callUntilFunction), ++count);
    }

    // max大于0时
    // 内部需要在每次执行之前检查一下是否达到上限
    return function callUntilFunction() {
        if (++count > max) {
            throw new Error('retry max');
        }

        fn(doneGetter(callUntilFunction), count);
    }
}


/**
 * 执行一个函数，成功或失败到上限之前将重复执行
 * @param callback until执行器
 * @param emitter 事件发生器
 * @param max 最大错误次数
 */
export function until(callback: Function, emitter: Function, max: number) {
    const doneGetter = doneFunctionGenerator(emitter, 'until');

    const callUntilFunction = createCallWrap(callback, max, doneGetter);

    // 推入异步中，使后面的链式注册不影响主函数的执行
    setTimeout(call, 0);

    function call() {
        try {
            callUntilFunction();
        } catch (err) {
            emitter('error', err);
        }
    }
}
