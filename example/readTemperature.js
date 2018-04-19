#!/usr/bin/env node
'use strict';

const max31856 = require('../max31856.js');

const sensor = new max31856.MAX31856(0, 0, max31856.T_TYPE);
console.log(sensor.tempC());
