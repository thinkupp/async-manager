import { loop } from '../utils/const';

/**
 * @param queue 调度链
 * @param type 主函数/回调函数/any 名称
 * @param fn 主函数执行体
 */
export const doneFunctionGenerator = function(emitter: Function, type: string) {
    // doneGetter
    return function get(fn: Function) {
        let disabled: boolean = false;

        function done (data: any) {
            callBroker('success', data);
        }
    
        done.break = function(err: any) {
            callBroker('error', err);
        }
    
        done.again = fn;

        // TODO type
        // 在某些情况下done会有一些扩展函数，比如retry等

        function callBroker(type: string, data: any) {
            if (disabled) return;
            disabled = true;
            done.break = done.again = loop;
            emitter(type, data);
        }

        return done;
    }
}
