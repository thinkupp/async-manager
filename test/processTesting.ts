/** 整体流程测试 */
import { AsyncManager } from '../src/index';

const asyncManager = new AsyncManager();

// until模块
function tUntil() {
    // 用户传入的函数报错时
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
        console.log('[Until]Success: [1]成功捕获错误');
    })

    // 设置最大重试次数
    // 并且不手动执行 成功/失败 行为
    let uCount: number = 0;
    asyncManager.until(function(count: number, done: any) {
        uCount = count;

    }, 5).then(function() {
        logError('until', '[2]不该执行这里！')
    }).catch(function() {
        if (uCount === 5) {
            logError('until', '[2]执行次数错误！')
        } else {
            console.log('until success: [2] 成功自动终止until')
        }
    })
}

function logError(module: string, message: string) {
    console.error(`[${module}] - Error: ${message}`);
}

tUntil();













/**
 * 已知的问题：
 * 1、两个实例并行执行
 */
