/** 整体流程测试 */

import { AsyncManager } from '../src/index';
import { eventTests } from './event.test';

const asyncManager = new AsyncManager();

// until模块
function tUntil() {
    // 用户传入的函数报错时
    // 期望捕获错误
    var timer1: any;
    asyncManager.until(function() {
        timer1 = setTimeout(function() {
            logError('until', '[1]没有触发回调！');
        }, 0)
        throw new Error('[1] 用户传入的函数执行错误');
    }).then(function() {
        logError('until', '[1]不该执行这里！');
    }).catch(function() {
        clearTimeout(timer1);
        logSuccess('until', '[1]成功捕获错误');
    })

    // 不设置最大重试次数
    // 不return阻断 手动执行成功
    // 期望执行成功回调并且不再执行until函数
    let uCount = 0;
    asyncManager.until(function(done: any, count: number) {
        uCount = count;
        if (count === 5) {
            done('success');
        }
        done.again();
        if (count > 5) {
            logError('until', '[2]不该再继续执行了')
        }
    }).then(function(res: any) {
        if (res === 'success') {
            logSuccess('until', '[2]成功');
        } else {
            logError('until', '[2]返回数据不对');
        }
    }).catch(function(err: any) {
        logError('until', '[2]不该执行这里！' + err.message);
    })

    // 不设置最大重试次数
    // 期望执行200次后内部抛出错误
    asyncManager.until(function(done: any, count: number) {
        if (count >= 200) {
            throw new Error('达到设定执行上限');
        }
        done.again();
    }).then(function() {
        logError('until', '[3]不该执行这里！')
    }).catch(function(err: any) {
        if (err.message === '达到设定执行上限') {
            logSuccess('until', '[3]成功')
        } else {
            logError('until', '[3]捕获的错误不是期望的错误')
        }
    })

    // 不设置最大重试次数
    // 期望捕获到栈溢出的错误
    asyncManager.until(function(done: any) {
        done.again();
    }).then(function() {
        logError('until', '[4]不该执行这里！')
    }).catch(function(err: any) {
        if (err.message === 'Maximum call stack size exceeded') {
            logSuccess('until', '[4]成功')
        } else {
            logError('until', '[4]捕获的错误不是期望的错误：' + err.message)
        }
    })

    // 设置最大重试次数
    // 并且不手动执行 成功/失败 行为
    // 期望在执行了指定次数后抛出错误
    uCount = 0;
    asyncManager.until(function(done: any, count: number) {
        uCount = count;
        done.again();
    }, 5).then(function() {
        logError('until', '[5]不该执行这里！')
    }).catch(function() {
        if (uCount !== 5) {
            logError('until', '[5]执行次数错误！')
        } else {
            logSuccess('until', '[5]成功自动终止until')
        }
    })

    // 设置最大重试次数
    // 手动执行成功
    // 期望进入成功回调
    asyncManager.until(function(done: any, count: number) {
        done(count);
    }, 10).then(function(res: any) {
        if (res === 1) {
            logSuccess('until', '[6]成功')
        } else {
            logError('until', '[6]错误的结果：' + res)
        }
    }).catch(function(err: any) {
        logError('until', '[6]不该执行这里：' + err.message);
    })

    // [7]done -> done.break -> done.again
    // 期望只有done执行成功
    asyncManager.until(function(done: any, count: number) {
        done(count);
        done.break();
        done.again();
        if (count > 1) {
            // count不能大于1因为期望执行一次
            logError('until', '[7]函数执行多次');
        }
    }).then(function(res: any) {
        if (res === 1) {
            logSuccess('until', '[7]成功');
        } else {
            logError('until', '[7]错误的执行次数：' + res);
        }
    }).catch(function(err: any) {
        logError('until', '[7]不该执行这里：' + err.message);
    })

    // [8]done.break -> done.again -> done
    // 期望捕获错误
    asyncManager.until(function(done: any, count: number) {
        done.break(count);
        done.again();
        done('nothing');

        if (count > 1) {
            logError('until', '[8]函数执行多次');
        }
    }).then(function(res: any) {
        logError('until', '[8]不该执行这里：' + res)
    }).catch(function(err: any) {
        if (err === 1) {
            logSuccess('until', '[8]成功')
        } else {
            logError('until', '[8]错误信息异常：' + err.message)
        }
    })

    // [9]done.again -> done -> done.break
    // catch 、 then
    // 期望捕获栈溢出的错误
    asyncManager.until(function(done: any, count: number) {
        done.again();
        done(count);
        done.break(count);
    }).catch(function(err: any) {
        if (err.message === 'Maximum call stack size exceeded') {
            logSuccess('until', '[9]成功')
        } else {
            logError('until', '[9]错误信息异常：' + err.message)
        }
    }).then(function() {
        logError('until', '[9]不该执行这里！');
    })

    // [10]在then中抛出错误
    // 期望：catch中抛出
    let timer2: any;
    asyncManager.until(function(done: any) {
        done();

        timer2 = setTimeout(function() {
            logError('until', '[10]没有触发回调！')
        }, 0);
    }).then(function() {
        throw new Error('报错了');
    }).catch(function(err: any) {
        clearTimeout(timer2);
        if (err.message === '报错了') {
            logSuccess('until', '[10]成功')
        } else {
            logError('until', '[10]捕获到错误，但是错误信息不对：' + err.message);
        }
    })

    // [11]then中传入Promise
    // 期望：最后一个then中拿到Promise解析完后的值
    asyncManager.until(function(done: any) {
        done();
    }).then(function() {
        return new Promise((resolve, reject) => {
            resolve(1)
        })
    }).then(function(res: any) {
        if (res === 1) {
            logSuccess('until', '[11]成功')
        } else {
            logError('until', '[11]返回值不对：' + res);
        }
    }).catch(function(err: any) {
        logError('until', '[11]不该执行这里！' + err.message)
    })

    // [12]传入多个then函数
    // 期望：执行所有的then函数
    let n = 0;
    asyncManager.until(function(done: any) {
        done();
    });
    for(let i = 0; i < 20; i++) {
        asyncManager.then(function() {
            n++;
        })
    }

    asyncManager.then(function() {
        if (n === 20) {
            logSuccess('until', '[12]成功')
        } else {
            logError('until', '[12]执行次数不对！' + n);
        }
    }).catch(function(err: any) {
        logError('until', '[12]不该执行这里！' + err.message)
    })

    // [13] 传入多个then函数，在过程中抛出错误，传入多个catch
    // 期望：不会执行剩下的then函数以及只有最后一个catch执行
    let n1 = 0;
    for(let i = 0; i < 10; i++) {
        asyncManager.then(function() {
            n1++;
            if (i > 5) {
                throw new Error('ERROR')
            }
        })

        asyncManager.catch(function(err: any) {
            logError('until', '[13]错误：不该执行这里！' + err.message)
        })
    }

    asyncManager.catch(function(err: any) {
        if (err.message === 'ERROR') {
            logSuccess('until', '[13]成功')
        } else {
            logError('until', '[13]错误信息异常：' + err.message);
        }
    })
}

function logSuccess(module: string, message: string) {
    console.log(`[${module}] - Success: ${message}`);
}

function logError(module: string, message: string) {
    console.error(`[${module}] - Error: ${message}`);
}

tUntil();
// eventTests();

// TODO catch之后可以再进入then
// then之后删除自身
