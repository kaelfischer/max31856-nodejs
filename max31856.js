'use strict';
const spi = require('spi-device');

const CONST_THERM_LSB = 2**-7;
const CONST_THERM_BITS = 19;
const CONST_CJ_LSB = 2**-6;
const CONST_CJ_BITS = 14;

// ### Register constants, see data sheet Table 6 (in Rev. 0) for info.;
// # Read Addresses
const REG_READ_CR0 = 0x00;
const REG_READ_CR1 = 0x01;
const REG_READ_MASK = 0x02;
const REG_READ_CJHF = 0x03;
const REG_READ_CJLF = 0x04;
const REG_READ_LTHFTH = 0x05;
const REG_READ_LTHFTL = 0x06;
const REG_READ_LTLFTH = 0x07;
const REG_READ_LTLFTL = 0x08;
const REG_READ_CJTO = 0x09;
const REG_READ_CJTH = 0x0A;  // Cold-Junction Temperature Register, MSB;
const REG_READ_CJTL = 0x0B;  //# Cold-Junction Temperature Register, LSB;
const REG_READ_LTCBH = 0x0C; //# Linearized TC Temperature, Byte 2;
const REG_READ_LTCBM = 0x0D; //# Linearized TC Temperature, Byte 1;
const REG_READ_LTCBL = 0x0E; //# Linearized TC Temperature, Byte 0;
const REG_READ_FAULT = 0x0F; //# Fault status register;

//# Write Addresses
const REG_WRITE_CR0 = 0x80;
const REG_WRITE_CR1 = 0x81;
const REG_WRITE_MASK = 0x82;
const REG_WRITE_CJHF = 0x83;
const REG_WRITE_CJLF = 0x84;
const REG_WRITE_LTHFTH = 0x85;
const REG_WRITE_LTHFTL = 0x86;
const REG_WRITE_LTLFTH = 0x87;
const REG_WRITE_LTLFTL = 0x88;
const REG_WRITE_CJTO = 0x89;
const REG_WRITE_CJTH = 0x8A;  //# Cold-Junction Temperature Register, MSB;
const REG_WRITE_CJTL = 0x8B;  //# Cold-Junction Temperature Register, LSB;

//# Pre-config Register Options
const CR0_READ_ONE = 0x40; //# One shot reading, delay approx. 200ms then read temp registers;
const CR0_READ_CONT = 0x80; //# Continuous reading, delay approx. 100ms between readings;

//  Thermocouple Types
const B_TYPE = 0x0 
const E_TYPE = 0x1 
const J_TYPE = 0x2 
const K_TYPE = 0x3 
const N_TYPE = 0x4 
const R_TYPE = 0x5 
const S_TYPE = 0x6 
const T_TYPE = 0x7 

const FAULTS = ['Thermocouple Open-Circuit Fault',
				'Overvoltage or Undervoltage Input Fault',
				'Thermocouple Temperature Low Fault',
				'Thermocouple Temperature High Fault',
				'Cold-Junction Low Fault',
				'Cold-Junction High Fault',
				'Thermocouple Out-of-Range',
				'Cold Junction Out-of-Range',]


class MAX31856 {
    constructor(bus,device,tcType) {
	// use slow speed for better results on noisy prototype boards
	this._device = spi.openSync(bus, device,
				    {mode:spi.MODE3,
				     maxSpeedHz: 50000});
	//console.log('device: ' + this._device);
	// set continuious read
	this.writeRegister(REG_WRITE_CR0, CR0_READ_CONT);

	// set TC type ans # of samples = 4
	this.writeRegister(REG_WRITE_CR1,(0x2 << 4) + tcType);

	return this;
    }
    
    readRegister(registerAddress) {
	var message = [{sendBuffer: Buffer.from([registerAddress, 0x00]),
		      receiveBuffer: Buffer.alloc(2),
		      byteLength: 2
		     }];
	this._device.transferSync(message);
	return message[0].receiveBuffer[1];
    }

    writeRegister(registerAddress,outByte) {
	this._device.transferSync(
	    [{sendBuffer:Buffer.from([registerAddress,outByte]),
	      byteLength:2}]);
	return null;
    }

    tempC() {
		const lsb = this.readRegister(REG_READ_LTCBL);
		const msb = this.readRegister(REG_READ_LTCBM);
		const hsb = this.readRegister(REG_READ_LTCBH);

        //console.log(lsb);
        //console.log(msb);
        //console.log(hsb);
        
		var tempBytes = (((hsb & 0x7F) << 16) + (msb << 8) + lsb);
		tempBytes = tempBytes >> 5;

		if (hsb & 0x80) {
			tempBytes -= 2**(CONST_THERM_BITS -1);
		}
		const tempC = tempBytes*CONST_THERM_LSB;
		return tempC;
    }
    
    faultRegister() {
		const faultByte = this.readRegister(REG_READ_FAULT);
		return faultByte;
	}
	
	faults() {
		var rv = [];
		const mask = 0x1;
		const faultByte = this.faultRegister();
		for (let i of Array(8).keys()) {
			if ( faultByte & (mask << i)) {
				rv.push(FAULTS[i]);
			}
		}
		return rv;	
	}
}



/*
const testDev = new MAX31856(0,0,T_TYPE);
console.log(testDev.tempC());
console.log(testDev._device);
console.log(Number(testDev.readRegister(REG_READ_CR1)).toString(2));
*/


module.exports = {
	CONST_THERM_LSB: CONST_THERM_LSB,
	CONST_THERM_BITS: CONST_THERM_BITS,
	CONST_CJ_LSB: CONST_CJ_LSB,
	CONST_CJ_BITS: CONST_CJ_BITS,
	REG_READ_CR0: REG_READ_CR0,
	REG_READ_CR1: REG_READ_CR1,
	REG_READ_MASK: REG_READ_MASK,
	REG_READ_CJHF: REG_READ_CJHF,
	REG_READ_CJLF: REG_READ_CJLF,
	REG_READ_LTHFTH: REG_READ_LTHFTH,
	REG_READ_LTHFTL: REG_READ_LTHFTL,
	REG_READ_LTLFTH: REG_READ_LTLFTH,
	REG_READ_LTLFTL: REG_READ_LTLFTL,
	REG_READ_CJTO: REG_READ_CJTO,
	REG_READ_CJTH: REG_READ_CJTH,
	REG_READ_CJTL: REG_READ_CJTL,
	REG_READ_LTCBH: REG_READ_LTCBH,
	REG_READ_LTCBM: REG_READ_LTCBM,
	REG_READ_LTCBL: REG_READ_LTCBL,
	REG_READ_FAULT: REG_READ_FAULT,
	REG_WRITE_CR0: REG_WRITE_CR0,
	REG_WRITE_CR1: REG_WRITE_CR1,
	REG_WRITE_MASK: REG_WRITE_MASK,
	REG_WRITE_CJHF: REG_WRITE_CJHF,
	REG_WRITE_CJLF: REG_WRITE_CJLF,
	REG_WRITE_LTHFTH: REG_WRITE_LTHFTH,
	REG_WRITE_LTHFTL: REG_WRITE_LTHFTL,
	REG_WRITE_LTLFTH: REG_WRITE_LTLFTH,
	REG_WRITE_LTLFTL: REG_WRITE_LTLFTL,
	REG_WRITE_CJTO: REG_WRITE_CJTO,
	REG_WRITE_CJTH: REG_WRITE_CJTH,
	REG_WRITE_CJTL: REG_WRITE_CJTL,
	CR0_READ_ONE: CR0_READ_ONE,
	CR0_READ_CONT: CR0_READ_CONT,
	B_TYPE: B_TYPE,
	E_TYPE: E_TYPE,
	J_TYPE: J_TYPE,
	K_TYPE: K_TYPE,
	N_TYPE: N_TYPE,
	R_TYPE: R_TYPE,
	S_TYPE: S_TYPE,
	T_TYPE: T_TYPE,
	MAX31856: MAX31856,
};
