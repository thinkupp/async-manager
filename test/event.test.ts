import { EventEmitter } from '../src/libs/index';

export const eventTests = function() {
    const ee = new EventEmitter();

    const cb1 = function(message: any) {
        console.log('has click', message)
    };

    ee.on('click', cb1);

    ee.emit('click', 'hello!');
    ee.emit('click', 'hello1!')
    ee.emit('click', 'hello2!')

    ee.off('click', cb1);
    ee.emit('click', 'hello~');
    ee.emit('click', 'hello1~');

    ee.once('click', function() {
        console.log('once');
    })

    ee.emit('click');
    ee.emit('click');
}
