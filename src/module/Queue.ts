import { AddParam, TickPart } from '../../types/index'

const MAIN_FUNCTION_METHODS = ['until'];
const SPECIAL_FUNCTION_METHODS = ['then'];

const INIT_HEAD: string = JSON.stringify({
    pref: null,
    // 下个tick
    next: null,
    // 成功的回调可以有一组
    then:[],
    // 失败的回调只能有一个且只第一个生效
    catch: void 0,
    // 主函数
    // 一个主函数在序列中就是一帧
    main: void 0,
    // 主函数名称
    type: ''
})

export class Queue {
    private head: TickPart;
    private last: TickPart;
    private item: TickPart;

    constructor() {
        this.head = JSON.parse(INIT_HEAD);
        this.item = this.last = this.head;
    }

    // 是否为主函数
    // 一帧中只能有一个主函数
    public isMainFunction(type: string) : boolean {
        return MAIN_FUNCTION_METHODS.includes(type)
    }

    // 是否特殊函数
    // 一帧中特殊函数可以有多个特殊函数
    public isSpecialFunction(type: string) : boolean {
        return SPECIAL_FUNCTION_METHODS.includes(type);
    }

    // 向任务序列中增加一帧
    public add(param: AddParam) {
        let { type, call } = param;
        const last = this.last;

        // 特殊函数不设上限
        if (this.isSpecialFunction(type)) {
            last[type].push(call);
        } else {
            if (this.isMainFunction(type)) {
                // 如果已有主函数则推入下个tick
                if (last.main) {
                    // 链中增加一帧并改变last的指向
                    last.next = this.last = Object.assign(JSON.parse(INIT_HEAD), {
                        main: call,
                        type,
                        prev: last
                    });
                    return;
                }
    
                last.type = type;
                type = 'main';
            }
    
            last[type] = call;
        }
    }

    // 执行当前tick的主函数
    // TODO：可以在这里劫持错误事件 避免再在主函数实现时处理
    public callMainFunction() {
        this.item.main();
    }

    /**
     * 执行回调函数
     * @param type 回调函数类型（then or catch）
     * @param data 给函数的传参
     */
    // TODO: 拆解成callSuccess & callError
    public callCallback(type: string, data: any) {
        const item = this.item;
        const that = this;
    
        // 如果回调函数不存在则忽略
        if (this.isSpecialFunction(type)) {
            let current = data;
            const cbs: Array<Function> = item[type];
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
                that.item = that.last = JSON.parse(INIT_HEAD);
                that.item.prev = item;
            }
            // 执行下一个主函数
            if (that.item.main) {
                that.callMainFunction();
            }
        }
    }
}