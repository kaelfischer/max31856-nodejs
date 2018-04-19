#!/usr/bin/env node

'use strict';

const max31856 = require('../max31856.js');

//console.log(max31856);

const sensor = new max31856.MAX31856(0,0,max31856.T_Type);

console.log(Number(sensor.faultRegister()).toString(2));
console.log(sensor.faults());
console.log(sensor.tempC());
