# max31856-nodejs
Node interface to the max31865 thermocouple converter over SPI on Raspberry Pi, BeagleBone, etc.

This is the author's first NodeJS project, your patientce is appreciated.

The MAX31856 is a SPI based "universal" digital converter for thermocouples.  Types B, E, J, K, N, R, S and T are supported by the device.

The reference implementation used for development and testing is Raspberry Pi 3 and the Adafruit MAX31865 breakout board

#References
[MAX31856 Datasheet](https://datasheets.maximintegrated.com/en/ds/MAX31856.pdf)
[John Robinson's](https://github.com/johnrbnsn)[Python max31856 implementation](https://github.com/johnrbnsn/Adafruit_Python_MAX31856)
[Brian Cooke's] very nice [spi-device](https://github.com/fivdi/spi-device) for Node.