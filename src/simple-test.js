const AsyncManager = require('./index');

const asyncManager = new AsyncManager();
var a = asyncManager
.until(function(count, done) {
    // done('success');
    done.again();
}, 2)
.then(function(message) {
    console.log('t1', message);
    return 1;
})
.then(function(message) {
    console.log('t2', message);
    throw new Error('t2 error')
})
.catch(function(err) {
    console.log('fail', err)
})
.until(function() {
    console.log('until');
    throw new Error('test fail')
}).catch(function(err) {
    console.log('err message', err.message)
})
