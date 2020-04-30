import { Queue } from "../../types";
import { loop } from '../utils/const';

/**
 * @param queue 调度链
 * @param type 主函数/回调函数/...any
 */
export const doneFunctionGenerator = function(queue: Queue, type: string) {
    // doneGetter
    return function get() {
        let disabled: boolean = false;

        function done (data: any) {
            callBroker('then', data);
        }
    
        done.break = function(err: any) {
            callBroker('catch', err);
        }
    
        done.again = queue.callMainFunction;

        // TODO type
        // 在某些情况下done会有一些扩展函数，比如retry等

        function callBroker(callbackType: string, data: any) {
            if (disabled) return;
            disabled = true;
            done.break = done.again = loop;
            queue.callCallback(callbackType, data);
        }

        return done;
    }
}
