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
        logSuccess('until', '[1]成功捕获错误');
    })

    // 设置最大重试次数
    // 并且不手动执行 成功/失败 行为
    let uCount: number = 0;
    asyncManager.until(function(count: number, done: any) {
        uCount = count;
        done.again();
    }, 5).then(function() {
        logError('until', '[2]不该执行这里！')
    }).catch(function() {
        if (uCount !== 5) {
            logError('until', '[2]执行次数错误！')
        } else {
            logSuccess('until', '[2]成功自动终止until')
        }
    })

    // 不设置最大重试次数
    // 执行200次后内部抛出错误
    asyncManager.until(function(count: number, done: any) {
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
}

function logSuccess(module: string, message: string) {
    console.log(`[${module}] - Success: ${message}`);
}

function logError(module: string, message: string) {
    console.error(`[${module}] - Error: ${message}`);
}

tUntil();













/**
 * 已知的问题：
 * 1、两个实例并行执行
 */
