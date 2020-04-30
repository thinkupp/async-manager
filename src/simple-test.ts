import { AsyncManager } from './index';

const asyncManager = new AsyncManager();

asyncManager
.until(function(count: number, done: any) {
    // done('success');
    done.again();
}, 2)
.then(function(message: any) {
    console.log('t1', message);
    return 1;
})
.then(function(message: any) {
    console.log('t2', message);
    throw new Error('t2 error')
})
.catch(function(err: any) {
    console.log('fail', err.message)
})
.until(function() {
    console.log('until');
    throw new Error('test fail')
}).catch(function(err: any) {
    console.log('err message', err.message)
})
