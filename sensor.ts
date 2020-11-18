

//% weight=20 color=#a742f5 block="Advanced Sensor"
namespace AdvSensor {

    let NTC_table = [
    999, 997, 995, 993, 991,   // -40  -  -36
    989, 986, 984, 981, 978,   // -35  -  -31
    975, 972, 969, 965, 962,   // -30  -  -26
    958, 954, 949, 945, 940,   // -25  -  -21
    935, 930, 925, 919, 914,   // -20  -  -16
    908, 901, 895, 888, 881,   // -15  -  -11
    874, 867, 859, 851, 843,   // -10  -  -6
    834, 826, 817, 808, 799,   //  -5  -  -1
    789, 780, 770, 760, 749,   //   0  -  4
    739, 728, 718, 707, 696,   //   5  -  9
    685, 673, 662, 651, 639,   //  10  -  14
    628, 616, 604, 593, 581,   //  15  -  19
    570, 558, 546, 535, 523,   //  20  -  24
    512, 501, 489, 478, 467,   //  25  -  29
    456, 445, 435, 424, 414,   //  30  -  34
    404, 394, 384, 374, 364,   //  35  -  39
    355, 346, 336, 328, 319,   //  40  -  44
    310, 302, 294, 286, 278,   //  45  -  49
    270, 263, 256, 249, 242,   //  50  -  54
    235, 228, 222, 216, 210,   //  55  -  59
    204, 198, 193, 187, 182,   //  60  -  64
    177, 172, 167, 162, 158,   //  65  -  69
    153, 149, 145, 141, 137,   //  70  -  74
    133, 129, 126, 122, 119,   //  75  -  79
    115, 112, 109, 106, 103,   //  80  -  84
    100
]

    /**
     * get NTC Temperature
     * @param pin is ADC pin, eg: AnalogPin.P0
     */
    //% blockId="NTCSenor_GET" block="Get water temperature at %pin"
    //% group="Water"
    //% weight=50
    export function ntc_Temperature(pin:AnalogPin): number {
        let value=pins.analogReadPin(pin)*3.3/5
        for (let i = 0; i < NTC_table.length; i++) {
            if (value > NTC_table[i])
                return i - 40;
        }
        return 85;
    }
    
   	let ph_value = ""
		//% blockId="readPH"
		//% block="Read PH value at %pin"
		//% weight=40 group="Water"
    export function readPH(pin:AnalogPin): string {
			let sensorarray: number[] = []
			for (let i = 0; i < 10; i++) {
						sensorarray.push(pins.analogReadPin(AnalogPin.P0))
						basic.pause(10)
				}
				sensorarray.sort((n1, n2) => n1 - n2);
			for (let value of sensorarray) {
						serial.writeLine(value.toString())
				}
				ph_value = (sensorarray[5] * 5 * 10 * 35/ 1024 ).toString()
			serial.writeLine("===========")
				if ( ph_value.length == 3) {
						serial.writeLine("PH: " + ph_value.substr(0, 1) + "." + ph_value.substr(1,  ph_value.length))
						return ph_value.substr(0, 1) + "." + ph_value.substr(1,  ph_value.length)
				} else {
						serial.writeLine("PH: " + ph_value.substr(0, 2) + "." + ph_value.substr(2,  ph_value.length))
						return ph_value.substr(0, 2) + "." + ph_value.substr(2,  ph_value.length)
				}
    }
    let ph_value_number = 0
		//% blockId="readPHNumber"
		//% block="Read PH value (x100) pin %ports| offset %offset"
		//% weight=40 group="Water"
		export function readPhNumber(ports: AnalogPin, offset: number): number {

			let temp = 0;
			temp=ports		
			let sensorarray: number[] = []
			for (let i = 0; i < 10; i++) {
						sensorarray.push(pins.analogReadPin(temp))
						basic.pause(10)
				}
				sensorarray.sort((n1, n2) => n1 - n2);
			for (let value of sensorarray) {
						serial.writeLine(value.toString())
				}
				ph_value_number = (sensorarray[5] * 5 * 10 * 35/ 1024) + offset
				return ph_value_number
		}
    /**
    * get water level value (0~100)
    * @param waterlevelpin describe parameter here, eg: AnalogPin.P0
    */
    //% group="Water"  
    //% blockId="readWaterLevel" block="value of water level(0~100) at pin %waterlevelpin"
    //% weight=60
    export function ReadWaterLevel(waterlevelpin: AnalogPin): number {
        let voltage = 0;
        let waterlevel = 0;
        voltage = pins.map(
            pins.analogReadPin(waterlevelpin),
            0,
            700,
            0,
            100
        );
        waterlevel = voltage;
        return Math.round(waterlevel)
    }


}
