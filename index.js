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

function loop() {};
const O = Object.create(null);

// AsyncManager / PromiseManager
module.exports = function AsyncManager() {
    let status = 'normal';
    
    const context = {
        until: _until,
        then: _then,
        catch: _catch
    };

    const queue = new Queue();
    const managerApi = new ManagerApi(context, queue);
    
    function _then(callback) {
        return pushTask('success', callback);
    }

    function _catch(callback) {
        return pushTask('catch', callback);
    }

    function _until(callback, max) {
        return pushTask('until', callback, max);
    }

    function pushTask(type, callback, ...arg) {
        // 暂时不支持函数以外的值传入
        if (typeof callback === 'function') {
            const isMainFunction = queue.isMainFunction(type);

            // 当前只有主函数和回调函数两种
            // 回调函数执行后表示状态结束 可以开始下一个主函数的调用
            const newStatus = isMainFunction ? 'pending' : 'normal';

            queue.add({
                type,
                call: function cbWrap() {
                    const ret = isMainFunction ? managerApi[type].apply(O, [callback, ...arg]) : callback.apply(O, arguments);
                    status = newStatus;
                    return ret;
                }
            })

            // 如果当前没有在执行的主函数则立即开始一个主函数
            isMainFunction && (status === 'normal') && queue.callMainFunction(type);
        };

        return context;
    }

    return context;
}

function Queue() {
    this.initHead = JSON.stringify({
        // 下个tick
        next: null,
        // 成功的回调可以有一组
        success:[],
        // 失败的回调只能有一个且只第一个生效
        catch: void 0,
        // 类主函数推入下个tick
        // until: void 0,
        // 主函数
        // 一个主函数在序列中就是一帧
        main: void 0,
    })

    this.head = JSON.parse(this.initHead)
    this.item = this.last = this.head;
};

Queue.prototype.isMainFunction = function(type) {
    const methodNames = ['until'];
    return methodNames.includes(type);
}

// 特殊类型可以有多个回调函数
Queue.prototype.isSpecialType = function(type) {
    const specialTypes = ['success'];
    return specialTypes.includes(type);
}

Queue.prototype.add = function({ type, call }) {
    const last = this.last;

    if (this.isSpecialType(type)) {
        last[type].push(call);
    } else {
        if (this.isMainFunction(type)) {
            // 如果已有主函数则推入下个tick
            if (last.main) {
                this.last = last.next = {
                    main: call
                }
                return;
            }

            type = 'main';
        }

        last[type] = call;
    }
}

// 执行主函数
Queue.prototype.callMainFunction = function() {
    // if (!this.isMainFunction(type)) return false;
    // return !!this.item[type]();
    this.item.main();
}

// 执行回调函数
Queue.prototype.callCallback = function(type, data) {
    const item = this.item;
    const that = this;

    // 如果回调函数不存在则忽略
    if (this.isSpecialType(type)) {
        let current = data;
        const cbs = item[type];
        cbs.forEach((cb, index) => {
            if (index === cbs.length - 1) {
                // 等待Promise的完成
                Promise.resolve(current)
                    .then(response => {
                        try {
                            cb(response);
                            nextTick();
                        } catch (error) {
                            this.callCallback('catch', error)
                        }
                    })
                    .catch(error => {
                        this.callCallback('catch', error)
                    })
            } else {
                // 循环展开回调
                current = Promise.resolve(cb(current));
            }
        });
    } else if (item[type]) {
        item[type](data);
        nextTick();
    }

    function nextTick() {
        // 改变当前序列
        if (item.next) {
            that.item = item.next;
        } else {
            // 如果当前序列不存在则指向head
            that.item = that.last = JSON.parse(that.initHead)
        }
        // 执行下一个主函数
    }
}

function ManagerApi(context, queue) {
    // 创建一个until回调函数
    function createUntilDone(call) {
        let disabled = false;

        function done(data) {
            callBroker(function() {
                queue.callCallback('success', data);
            })
        }

        done.break = function(err) {
            callBroker(function() {
                queue.callCallback('catch', err);
            })
        }

        done.again = function() {
            callBroker(call)
        };

        function callBroker(callback) {
            if (disabled) {
                done.break = done.again = loop;
                return;
            };

            disabled = true;
            callback();
        }
        
        return done;
    }

    /**
     * @param {function} callback 迭代器
     * @param {?number} max 函数执行上限
     */
    this.until = function until(callback, max) {
        max = Number(max) || 0;
        let count = 0;

        setTimeout(call, 0);

        function call() {
            try {
                if (++count > max) {
                    throw new Error('error max')
                }

                const done = createUntilDone(call);
                callback(count, done);
            } catch (err) {
                queue.callCallback('catch', err);
            }
        }

        return context;
    }
}

// 注册函数功能
// syncer.register('getDom', function() {
//     return new Promise((resolve, reject) => {
//     })
// }).until(function(count, done) {
//     this.getDom().then(done).catch(err => {
//         if (count > 10) {
//             done.break();
//         } else {
//             done.again();
//         }
//     })
// })

// TODO: then/catch -> until -> then1/catch1 -> ... 会发生什么
// TODO: 主函数推入tick时也要注意顺序 OR 一个tick只能有一个主函数
// TODO: catch throw Error
