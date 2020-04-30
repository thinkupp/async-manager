const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

import { AsyncManager } from '../src/index';

const asyncManager = new AsyncManager();

describe('asyncManager', function() {
    describe('until模块', function() {
        it('用户函数抛出错误的时候', function() {
            asyncManager.until(function() {
                throw new Error('抛出了错误')
            }).catch(function() {
                throw new Error('抛出了错误')
            })
        })
    })
})