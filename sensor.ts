

//% weight=20 color=#a742f5 block="Advanced Module"
namespace AdvancedModule {

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

    // Water 
    //---------------------------------------------------------------------
    /**
     * get NTC Temperature
     * @param pin is ADC pin, eg: AnalogPin.P0
     */
    //% blockId="NTCSenor_GET" block="Get water temperature at %pin"
    //% group="Water"
    //% weight=90
    export function ntc_Temperature(pin: AnalogPin): number {
        let value = pins.analogReadPin(pin) * 3.3 / 5
        for (let i = 0; i < NTC_table.length; i++) {
            if (value > NTC_table[i])
                return i - 40;
        }
        return 85;
    }

    let ph_value = ""
    //% blockId="readPH"
    //% block="Read PH value at %pin"
    //% weight=80 group="Water"
    export function readPH(pin: AnalogPin): string {
        let sensorarray: number[] = []
        for (let i = 0; i < 10; i++) {
            sensorarray.push(pins.analogReadPin(AnalogPin.P0))
            basic.pause(10)
        }
        sensorarray.sort((n1, n2) => n1 - n2);
        for (let value of sensorarray) {
            serial.writeLine(value.toString())
        }
        ph_value = (sensorarray[5] * 5 * 10 * 35 / 1024).toString()
        serial.writeLine("===========")
        if (ph_value.length == 3) {
            serial.writeLine("PH: " + ph_value.substr(0, 1) + "." + ph_value.substr(1, ph_value.length))
            return ph_value.substr(0, 1) + "." + ph_value.substr(1, ph_value.length)
        } else {
            serial.writeLine("PH: " + ph_value.substr(0, 2) + "." + ph_value.substr(2, ph_value.length))
            return ph_value.substr(0, 2) + "." + ph_value.substr(2, ph_value.length)
        }
    }
    let ph_value_number = 0
    //% blockId="readPHNumber"
    //% block="Read PH value (x100) pin %ports| offset %offset"
    //% weight=70 group="Water"
    export function readPhNumber(ports: AnalogPin, offset: number): number {

        let temp = 0;
        temp = ports
        let sensorarray: number[] = []
        for (let i = 0; i < 10; i++) {
            sensorarray.push(pins.analogReadPin(temp))
            basic.pause(10)
        }
        sensorarray.sort((n1, n2) => n1 - n2);
        for (let value of sensorarray) {
            serial.writeLine(value.toString())
        }
        ph_value_number = (sensorarray[5] * 5 * 10 * 35 / 1024) + offset
        return ph_value_number
    }
    /**
    * get water level value (0~100)
    * @param waterlevelpin describe parameter here, eg: AnalogPin.P0
    */
    //% group="Water"  
    //% blockId="readWaterLevel" block="value of water level(0~100) at pin %waterlevelpin"
    //% weight=100
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


	
	
    // Gas
    //----------------------------------------------------------------------------
    /**
   * get Dust value
   * @param ledpin describe parameter here, eg: AnalogPin.P1
   * @param dustpin describe parameter here, eg: AnalogPin.P0
   */
    //% group="Gas"  
    //% blockId="readDustValue" block="value of Dust sensor at LEDpin %ledpin Dustpin %dustpin"
    //% weight=60
    export function ReadDustValue(ledpin:DigitalPin, dustpin: AnalogPin): number {
        let voltage = 0;
        let dust = 0;
        pins.digitalWritePin(ledpin, 0);   //on led
        control.waitMicros(160);
        voltage = pins.analogReadPin(dustpin);  //read value
        control.waitMicros(100);
        pins.digitalWritePin(ledpin, 1);       //off led
        voltage = pins.map( //remap the voltage to 0~3.3V
            voltage,
            0,
            1023,
            0,
            3.3
        );
        dust = (voltage*0.17-0.1)
        if (dust < 0) {
            dust = 0
        }
        return Math.round(dust*1000)

    }

    /**
      * get PM2.5 value
      * @param PM25pin describe parameter here, eg: AnalogPin.P0
      */
    //% group="Gas"  
    //% blockId="readPM25Value" block="value of PM2.5 sensor at pin %PM25pin"
    //% weight=59
    export function ReadPM25Value(PM25pin: DigitalPin): number {
        let pm25 = 0
        while (pins.digitalReadPin(PM25pin) != 0) {
        }//low
        while (pins.digitalReadPin(PM25pin) != 1) {
        }//high
        pm25 = input.runningTime()//start TimeHigh
        while (pins.digitalReadPin(PM25pin) != 0) {
        }//low
        pm25 = input.runningTime() - pm25   //End TimeHigh
        //now var pm25 = TH
        //Since the the formula P(ug/m3)=1000*(TH)/(TH+TL)
        //TH+TL assume is 1000ms, so P=1000*TH/1000=TH
        return pm25;
    }
	

    /**
     * get CO value
     * @param MQ7pin describe parameter here, eg: AnalogPin.P0
     */
    //% group="Gas"  
    //% blockId="readCOValue" block="value of MQ7 CO sensor at pin %MQ7pin"
    //% weight=55
    export function ReadCOValue(MQ7pin: AnalogPin): number {
        let Val = pins.analogReadPin(MQ7pin)
        let Val_map = pins.map(Val, 300, 1023, 0, 100)
        if(Val_map<0){Val_map=0}
        return Val_map
    }

    /**
       * get Smoke value
       * @param MQ2pin describe parameter here, eg: AnalogPin.P0
       */
    //% group="Gas"  
    //% blockId="readSmokeValue" block="value of MQ2 Smoke sensor at pin %MQ2pin"
    //% weight=58
	//% blockHidden=true
    export function ReadSmokeValue(MQ2pin: AnalogPin): number {
        let Val = pins.analogReadPin(MQ2pin)
        let Val_map = pins.map(Val, 30, 1023, 0, 100)
        if (Val_map < 0) { Val_map = 0 }
        return Val_map
    }

    /**
       * get Alcohol value
       * @param MQ3pin describe parameter here, eg: AnalogPin.P0
       */
    //% group="Gas"  
    //% blockId="readAlcoholValue" block="value of MQ3 Alcohol sensor at pin %MQ3pin"
    //% weight=57
    export function ReadAlcoholValue(MQ3pin: AnalogPin): number {
        let Val = pins.analogReadPin(MQ3pin)
        let Val_map = pins.map(Val, 320, 1023, 0, 100)
        if (Val_map < 0) { Val_map = 0 }
        return Val_map
    }
    /**
    * get Towngas value
    * @param MQ5pin describe parameter here, eg: AnalogPin.P0
    */
    //% group="Gas"  
    //% blockId="readTownGasValue" block="value of MQ5 Town Gas sensor at pin %MQ5pin"
    //% weight=56
    export function ReadTownGasValue(MQ5pin: AnalogPin): number {
        let Val = pins.analogReadPin(MQ5pin)
        let Val_map = pins.map(Val, 80, 1023, 0, 100)
        if (Val_map < 0) { Val_map = 0 }
        return Val_map
    }

    /**
   * get Hydrogen value
   * @param MQ8pin describe parameter here, eg: AnalogPin.P0
   */
    //% group="Gas"  
    //% blockId="readHydrogenValue" block="value of MQ8 Hydrogen sensor at pin %MQ8pin"
    //% weight=54
    export function ReadHydrogenValue(MQ8pin: AnalogPin): number {
        let Val = pins.analogReadPin(MQ8pin)
        let Val_map = pins.map(Val, 120, 1023, 0, 100)
        if (Val_map < 0) { Val_map = 0 }
        return Val_map
    }

    /**
      * get Air Quality value
      * @param MQ135pin describe parameter here, eg: AnalogPin.P0
      */
    //% group="Gas"  
    //% blockId="readAirQualityValue" block="value of MQ135 Air Quality sensor at pin %MQ135pin"
    //% weight=53
    export function ReadAirQualityValue(MQ135pin: AnalogPin): number {
        let Val = pins.analogReadPin(MQ135pin)
        let Val_map = pins.map(Val, 55, 1023, 0, 100)
        if (Val_map < 0) { Val_map = 0 }
        return Val_map
    }
// Gas
//----------------------------------------------------------------------------
	let TVOC_OK = true
	/* CO2*/
    function indenvGasStatus(): number {
        //pins.setPull(DigitalPin.P19, PinPullMode.PullUp)
        //pins.setPull(DigitalPin.P20, PinPullMode.PullUp)
        //basic.pause(200)
        pins.i2cWriteNumber(90, 0, NumberFormat.UInt8LE, true)
        //basic.pause(200)
        let GasStatus = pins.i2cReadNumber(90, NumberFormat.UInt8LE, false)
        //basic.pause(200)
        return GasStatus
    }

    function indenvGasReady(): boolean {
        if (TVOC_OK != true) {
            return false
        }
        //pins.setPull(DigitalPin.P19, PinPullMode.PullUp)
        //pins.setPull(DigitalPin.P20, PinPullMode.PullUp)
        //basic.pause(200)
        pins.i2cWriteNumber(90, 0, NumberFormat.UInt8LE, true)
        //basic.pause(200)
        if ((pins.i2cReadNumber(90, NumberFormat.UInt8LE, false) % 16) != 8) {
            return false
        }
        return true
    }
	/**
    * CO2 and TVOC Sensor (CS811) Start
    */
    //% blockId="indenvStart" block="CCS811 Start"
	//% group="CO2 and TVOC Sensor (CS811)"
    //% weight=52
    export function indenvStart(): void {
        TVOC_OK = true
        //pins.setPull(DigitalPin.P19, PinPullMode.PullUp)
        //pins.setPull(DigitalPin.P20, PinPullMode.PullUp)
        //basic.pause(200)
        //basic.pause(200)
        /* CJMCU-8118 CCS811 addr 0x5A reg 0x20 Read Device ID = 0x81 */
        pins.i2cWriteNumber(90, 32, NumberFormat.UInt8LE, true)
        //basic.pause(200)
        if (pins.i2cReadNumber(90, NumberFormat.UInt8LE, false) != 129) {
            TVOC_OK = false
        }
        basic.pause(200)
        /* CJMCU-8118 AppStart CCS811 addr 0x5A register 0xF4 */
        pins.i2cWriteNumber(90, 244, NumberFormat.UInt8LE, false)
        //basic.pause(200)
        /* CJMCU-8118 CCS811 Driving Mode 1 addr 0x5A register 0x01 0x0110 */
        pins.i2cWriteNumber(90, 272, NumberFormat.UInt16BE, false)
        basic.pause(200)
        /* CJMCU-8118 CCS811 Status addr 0x5A register 0x00 return 1 byte */
        pins.i2cWriteNumber(90, 0, NumberFormat.UInt8LE, true)
        //basic.pause(200)
        if (pins.i2cReadNumber(90, NumberFormat.UInt8LE, false) % 2 != 0) {
            TVOC_OK = false
        }
        basic.pause(200)
        pins.i2cWriteNumber(90, 0, NumberFormat.UInt8LE, true)
        //basic.pause(200)
        if (Math.idiv(pins.i2cReadNumber(90, NumberFormat.UInt8LE, false), 16) != 9) {
            TVOC_OK = false
        }
        basic.pause(200)
    }
	/**
     * Set TVOC and CO2 baseline (Baseline should be a decimal value)
     * @param value  , eg: 33915
     */
	//% group="CO2 and TVOC Sensor (CS811)"
    //% blockId=CCS811_setBaseline block="set CO2 and TVOC baseline|%value value"
	//% weight=51
	export function setBaseline(value: number): void {
        let buffer: Buffer = pins.createBuffer(3);
        buffer[0] = 0x20;
        buffer[1] = value >> 8 & 0xff;
        buffer[2] = value & 0xff;
        pins.i2cWriteBuffer(90, buffer);

    }
	/**
    * Read estimated CO2
    */
	//% group="CO2 and TVOC Sensor (CS811)"
    //% blockId="indenvgeteCO2" block="Value of CO2"
	//% weight=50
    export function indenvgeteCO2(): number {

        let i

        i = 0

        while (indenvGasReady() != true) {
            basic.pause(200)
            i = i + 1
            if (i >= 10)
                return -1;
        }
        //pins.setPull(DigitalPin.P19, PinPullMode.PullUp)
        //pins.setPull(DigitalPin.P20, PinPullMode.PullUp)
        //basic.pause(200)
        pins.i2cWriteNumber(90, 2, NumberFormat.UInt8LE, true)
        //basic.pause(200)
        return pins.i2cReadNumber(90, NumberFormat.UInt16BE, false)
    }
	/**
    * Read Total VOC
    */
	//% group="CO2 and TVOC Sensor (CS811)"
    //% blockId="indenvgetTVOC" block="Value of TVOC"
	//% weight=49
    export function indenvgetTVOC(): number {

        let i

        i = 0

        while (indenvGasReady() != true) {
            basic.pause(200)
            i = i + 1
            if (i >= 10)
                return -1;
        }
        //pins.setPull(DigitalPin.P19, PinPullMode.PullUp)
        //pins.setPull(DigitalPin.P20, PinPullMode.PullUp)
        //basic.pause(200)
        pins.i2cWriteNumber(90, 2, NumberFormat.UInt8LE, true)
        //basic.pause(200)
        return (pins.i2cReadNumber(90, NumberFormat.UInt32BE, false) % 65536)
    }
	
//TM1637
//-------------------------------------------------------------------------
    let TubeTab: number [] = [
    0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07,
    0x7f, 0x6f, 0x77, 0x7c, 0x39, 0x5e, 0x79, 0x71
];
    /**
     * 
     */
    export class TM1637
    {
        clkPin: DigitalPin;
        dataPin: DigitalPin;
        brightnessLevel: number;     
        pointFlag: boolean;
        buf: Buffer;

        private writeByte(wrData: number) 
        {
            for(let i = 0; i < 8; i ++)
            {
                pins.digitalWritePin(this.clkPin, 0);
                if(wrData & 0x01)pins.digitalWritePin(this.dataPin, 1);
                else pins.digitalWritePin(this.dataPin, 0);
                wrData >>= 1;
                pins.digitalWritePin(this.clkPin, 1);
            }
            
            pins.digitalWritePin(this.clkPin, 0); // Wait for ACK
            pins.digitalWritePin(this.dataPin, 1);
            pins.digitalWritePin(this.clkPin, 1);
        }
        
        private start()
        {
            pins.digitalWritePin(this.clkPin, 1);
            pins.digitalWritePin(this.dataPin, 1);
            pins.digitalWritePin(this.dataPin, 0);
            pins.digitalWritePin(this.clkPin, 0);
        }
        
        private stop()
        {
            pins.digitalWritePin(this.clkPin, 0);
            pins.digitalWritePin(this.dataPin, 0);
            pins.digitalWritePin(this.clkPin, 1);
            pins.digitalWritePin(this.dataPin, 1);
        }
        
        private coding(dispData: number): number
        {
            let pointData = 0;
            
            if(this.pointFlag == true)pointData = 0x80;
            else if(this.pointFlag == false)pointData = 0;
            
            if(dispData == 0x7f)dispData = 0x00 + pointData;
            else dispData = TubeTab[dispData] + pointData;
            
            return dispData;
        } 

        /**
         * Show a 4 digits number on display
         * @param dispData value of number
         */

        //% blockId=tm1637_display_number block="%TM1637 |show number|%dispData"
        //% group="TM1637 4-Digit Display"
        //% subcategory=Display
        show(dispData: number)
        {       
            let compare_01:number = dispData % 100;
            let compare_001:number = dispData % 1000;

            if(dispData < 10)
            {
                this.bit(dispData, 3);
                this.bit(0x7f, 2);
                this.bit(0x7f, 1);
                this.bit(0x7f, 0);                
            }
            else if(dispData < 100)
            {
                this.bit(dispData % 10, 3);
                if(dispData > 90){
                    this.bit(9, 2);
                } else{
                    this.bit(Math.floor(dispData / 10) % 10, 2);
                }
                
                this.bit(0x7f, 1);
                this.bit(0x7f, 0);
            }
            else if(dispData < 1000)
            {
                this.bit(dispData % 10, 3);
                if(compare_01 > 90){
                    this.bit(9, 2);
                } else{
                    this.bit(Math.floor(dispData / 10) % 10, 2);
                }
                if(compare_001 > 900){
                    this.bit(9, 1);
                } else{
                    this.bit(Math.floor(dispData / 100) % 10, 1);
                }
                this.bit(0x7f, 0);
            }
            else if(dispData < 10000)
            {
                this.bit(dispData % 10, 3);
                if(compare_01 > 90){
                    this.bit(9, 2);
                } else{
                    this.bit(Math.floor(dispData / 10) % 10, 2);
                }
                if(compare_001 > 900){
                    this.bit(9, 1);
                } else{
                    this.bit(Math.floor(dispData / 100) % 10, 1);
                }
                if(dispData > 9000){
                    this.bit(9, 0);
                } else{
                    this.bit(Math.floor(dispData / 1000) % 10, 0);
                }
            }
            else 
            {
                this.bit(9, 3);
                this.bit(9, 2);
                this.bit(9, 1);
                this.bit(9, 0);
            }
        }
        
        /**
         * Set the brightness level of display at from 0 to 7
         * @param level value of brightness light level
         */
        //% blockId=tm1637_set_display_level block="%TM1637 |brightness level to|%level"
        //% level.min=0 level.max=7
        //% group="TM1637 4-Digit Display"
        //% subcategory=Display
        set(level: number)
        {
            this.brightnessLevel = level;
            
            this.bit(this.buf[0], 0x00);
            this.bit(this.buf[1], 0x01);
            this.bit(this.buf[2], 0x02);
            this.bit(this.buf[3], 0x03);
        }
        
        /**
         * Show a single number from 0 to 9 at a specified digit of 4-Digit Display
         * @param dispData value of number
         * @param bitAddr value of bit number
         */
        //% blockId=tm1637_display_bit block="%TM1637 |show single number|%dispData|at digit|%bitAddr"
        //% dispData.min=0 dispData.max=9
        //% bitAddr.min=0 bitAddr.max=3
        //% group="TM1637 4-Digit Display"
        //% subcategory=Display
        bit(dispData: number, bitAddr: number)
        {
            if((dispData == 0x7f) || ((dispData <= 9) && (bitAddr <= 3)))
            {
                let segData = 0;
                
                segData = this.coding(dispData);
                this.start();
                this.writeByte(0x44);
                this.stop();
                this.start();
                this.writeByte(bitAddr | 0xc0);
                this.writeByte(segData);
                this.stop();
                this.start();
                this.writeByte(0x88 + this.brightnessLevel);
                this.stop();
                
                this.buf[bitAddr] = dispData;
            }
        }
        
        /**
         * Turn on or off the colon point on 4-Digit Display
         * @param pointEn value of point switch
         */
        //% blockId=tm1637_display_point block="%TM1637 |turn|%point|colon point"
        //% group="TM1637 4-Digit Display"
        //% subcategory=Display
        point(point: boolean)
        {
            this.pointFlag = point;
            
            this.bit(this.buf[0], 0x00);
            this.bit(this.buf[1], 0x01);
            this.bit(this.buf[2], 0x02);
            this.bit(this.buf[3], 0x03);
        }
        
        /**
         * Clear the display
         */
        //% blockId=tm1637_display_clear block="%TM1637|clear"
        //% group="TM1637 4-Digit Display"
        //% subcategory=Display
        clear()
        {
            this.bit(0x7f, 0x00);
            this.bit(0x7f, 0x01);
            this.bit(0x7f, 0x02);
            this.bit(0x7f, 0x03);
        }
    }

    /**
     * Create a new TM1637 object
     * @param clkPin is clk pin, eg: DigitalPin.P14
     * @param dataPin is data pin,eg: DigitalPin.P15
     */
    //% blockId=tm1637_var_create block="TM1637 Display at|%clkPin|and|%dataPin"
    //% group="TM1637 4-Digit Display"
    //% blockSetVariable=TM1637
    //% subcategory=Display
    export function createDisplay(clkPin: DigitalPin, dataPin: DigitalPin): TM1637
    {
        let display = new TM1637();
        
        display.buf = pins.createBuffer(4);
        display.clkPin = clkPin;
        display.dataPin = dataPin;
        display.brightnessLevel = 0;
        display.pointFlag = false;
        display.clear();
        
        return display;
    }

//LCD1602
//-----------------------------------------------------


export enum LcdPosition1602 {
  //% block="1"
  Pos1 = 1,
  //% block="2"
  Pos2 = 2,
  //% block="3"
  Pos3 = 3,
  //% block="4"
  Pos4 = 4,
  //% block="5"
  Pos5 = 5,
  //% block="6"
  Pos6 = 6,
  //% block="7"
  Pos7 = 7,
  //% block="8"
  Pos8 = 8,
  //% block="9"
  Pos9 = 9,
  //% block="10"
  Pos10 = 10,
  //% block="11"
  Pos11 = 11,
  //% block="12"
  Pos12 = 12,
  //% block="13"
  Pos13 = 13,
  //% block="14"
  Pos14 = 14,
  //% block="15"
  Pos15 = 15,
  //% block="16"
  Pos16 = 16,
  //% block="17"
  Pos17 = 17,
  //% block="18"
  Pos18 = 18,
  //% block="19"
  Pos19 = 19,
  //% block="20"
  Pos20 = 20,
  //% block="21"
  Pos21 = 21,
  //% block="22"
  Pos22 = 22,
  //% block="23"
  Pos23 = 23,
  //% block="24"
  Pos24 = 24,
  //% block="25"
  Pos25 = 25,
  //% block="26"
  Pos26 = 26,
  //% block="27"
  Pos27 = 27,
  //% block="28"
  Pos28 = 28,
  //% block="29"
  Pos29 = 29,
  //% block="30"
  Pos30 = 30,
  //% block="31"
  Pos31 = 31,
  //% block="32"
  Pos32 = 32
}



export enum LcdBacklight {
  //% block="off"
  Off = 0,
  //% block="on"
  On = 8
}

export enum TextAlignment {
  //% block="left-aligned"
  Left,
  //% block="right-aligned"
  Right
}

export enum TextOption {
  //% block="align left"
  AlignLeft,
  //% block="align right"
  AlignRight,
  //% block="pad with zeros"
  PadWithZeros
}


  export enum Lcd {
    Command = 0,
    Data = 1
  }

  interface LcdState {
    i2cAddress: uint8;
    backlight: LcdBacklight;
    characters: Buffer;
    rows: uint8;
    columns: uint8;
    lineNeedsUpdate: uint8;
    refreshIntervalId: number;
  }

  let lcdState: LcdState = undefined;

  function connect(): boolean {
    if (0 != pins.i2cReadNumber(39, NumberFormat.Int8LE, false)) {
      // PCF8574
      connectLcd();
    } else if (0 != pins.i2cReadNumber(63, NumberFormat.Int8LE, false)) {
      // PCF8574A
      connectLcd();
    }
    return !!lcdState;
  }

  // Write 4 bits (high nibble) to I2C bus
  function write4bits(value: number) {
    if (!lcdState && !connect()) {
      return;
    }
    pins.i2cWriteNumber(lcdState.i2cAddress, value, NumberFormat.Int8LE);
    pins.i2cWriteNumber(lcdState.i2cAddress, value | 0x04, NumberFormat.Int8LE);
    control.waitMicros(1);
    pins.i2cWriteNumber(
      lcdState.i2cAddress,
      value & (0xff ^ 0x04),
      NumberFormat.Int8LE
    );
    control.waitMicros(50);
  }

  // Send high and low nibble
  function send(RS_bit: number, payload: number) {
    if (!lcdState) {
      return;
    }
    const highnib = payload & 0xf0;
    write4bits(highnib | lcdState.backlight | RS_bit);
    const lownib = (payload << 4) & 0xf0;
    write4bits(lownib | lcdState.backlight | RS_bit);
  }

  // Send command
  function sendCommand(command: number) {
    send(Lcd.Command, command);
  }

  // Send data
  function sendData(data: number) {
    send(Lcd.Data, data);
  }

  // Set cursor
  function setCursor(line: number, column: number) {
    const offsets = [0x00, 0x40, 0x14, 0x54];
    sendCommand(0x80 | (offsets[line] + column));
  }

  function updateCharacterBuffer(
    text: string,
    offset: number,
    length: number,
    columns: number,
    rows: number,
    alignment: TextAlignment,
    pad: string
  ): void {
    if (!lcdState && !connect()) {
      return;
    }

    if (!lcdState.refreshIntervalId) {
      lcdState.refreshIntervalId = control.setInterval(refreshDisplay, 500, control.IntervalMode.Timeout)
    }

    if (lcdState.columns === 0) {
      lcdState.columns = columns;
      lcdState.rows = rows;
      lcdState.characters = pins.createBuffer(lcdState.rows * lcdState.columns);

      // Clear display and buffer
      const whitespace = "x".charCodeAt(0);
      for (let pos = 0; pos < lcdState.rows * lcdState.columns; pos++) {
        lcdState.characters[pos] = whitespace;
      }
      updateCharacterBuffer(
        "",
        0,
        lcdState.columns * lcdState.rows,
        lcdState.columns,
        lcdState.rows,
        TextAlignment.Left,
        " "
      );
    }

    if (columns !== lcdState.columns || rows !== lcdState.rows) {
      return;
    }

    const fillCharacter =
      pad.length > 0 ? pad.charCodeAt(0) : " ".charCodeAt(0);

    let endPosition = offset + length;
    if (endPosition > lcdState.columns * lcdState.rows) {
      endPosition = lcdState.columns * lcdState.rows;
    }
    let lcdPos = offset;

    // Add padding at the beginning
    if (alignment == TextAlignment.Right) {
      while (lcdPos < endPosition - text.length) {
        if (lcdState.characters[lcdPos] != fillCharacter) {
          lcdState.characters[lcdPos] = fillCharacter;
          lcdState.lineNeedsUpdate |= (1 << Math.idiv(lcdPos, lcdState.columns))
        }
        lcdPos++;
      }
    }

    // Copy the text
    let textPosition = 0;
    while (lcdPos < endPosition && textPosition < text.length) {

      if (lcdState.characters[lcdPos] != text.charCodeAt(textPosition)) {
        lcdState.characters[lcdPos] = text.charCodeAt(textPosition);
        lcdState.lineNeedsUpdate |= (1 << Math.idiv(lcdPos, lcdState.columns))
      }
      lcdPos++;
      textPosition++;
    }

    // Add padding at the end
    while (lcdPos < endPosition) {
      if (lcdState.characters[lcdPos] != fillCharacter) {
        lcdState.characters[lcdPos] = fillCharacter;
        lcdState.lineNeedsUpdate |= (1 << Math.idiv(lcdPos, lcdState.columns))
      }
      lcdPos++;
    }
  }

  function sendLine(line: number): void {
    setCursor(line, 0);

    for (let position = lcdState.columns * line; position < lcdState.columns * (line + 1); position++) {
      sendData(lcdState.characters[position]);
    }
  }

  function refreshDisplay() {
    if (!lcdState) {
      return;
    }
    lcdState.refreshIntervalId = undefined

    for (let i = 0; i < lcdState.rows; i++) {
      if (lcdState.lineNeedsUpdate & 1 << i) {
        lcdState.lineNeedsUpdate &= ~(1 << i)
        sendLine(i)
      }
    }
  }

  function toAlignment(option?: TextOption): TextAlignment {
    if (
      option === TextOption.AlignRight ||
      option === TextOption.PadWithZeros
    ) {
      return TextAlignment.Right;
    } else {
      return TextAlignment.Left;
    }
  }

  function toPad(option?: TextOption): string {
    if (option === TextOption.PadWithZeros) {
      return "0";
    } else {
      return " ";
    }
  }

 
 

 /**
   * Displays a text on a LCD1602 in the given position range.
   * The text will be cropped if it is longer than the provided length.
   * If there is space left, it will be filled with pad characters.
   * @param text the text to show, eg: "Smarthon"
   * @param startPosition the start position on the LCD, [1 - 32]
   * @param length the maximum space used on the LCD, eg: 16
   * @param option configures padding and alignment, eg: TextOption.Left
   */
  //% subcategory=Display
  //% blockId="lcd_show_string_on_1602"
  //% block="LCD show %text | at position %startPosition=lcd_position_1602 with length %length || and %option"
  //% text.shadowOptions.toString=true
  //% length.min=1 length.max=32 length.fieldOptions.precision=1
  //% expandableArgumentMode="toggle"
  //% inlineInputMode="inline"
  //% weight=90
  //% group="LCD1602"
  export function showStringOnLcd1602(
    text: string,
    startPosition: number,
    length: number,
    option?: TextOption
  ): void {
    updateCharacterBuffer(
      text,
      startPosition-1,
      length,
      16,
      2,
      toAlignment(option),
      toPad(option)
    );
  }



/**
   * Clears the LCD1602 completely.
   */
  //% subcategory=Display
  //% blockId="lcd_clear_1602" block="LCD clear display"
  //% weight=75
  //% group="LCD1602"
  export function clearLcd1602(): void {
    showStringOnLcd1602("", 1, 32);
  }


  /**
   * Turns a LCD position into a number.
   * @param pos the LCD position, eg: LcdPosition1602.Pos1
   */
  //% subcategory=Display
  //% blockId=lcd_position_1602
  //% block="%pos"
  //% pos.fieldEditor="gridpicker"
  //% pos.fieldOptions.columns=16
  //% blockHidden=true
  //% group="LCD1602"
  export function position1602(pos: LcdPosition1602): number {
    return pos;
  }



  /**
   * Enables or disables the backlight of the LCD.
   * @param backlight new state of backlight, eg: LcdBacklight.On
   */
  //% subcategory="LCD1602"
  //% blockId="makerbit_lcd_backlight" block="LCD backlight %backlight"
  //% weight=79
    //% subcategory=Display
  export function setLcdBacklight(backlight: LcdBacklight): void {
    if (!lcdState && !connect()) {
      return;
    }
    lcdState.backlight = backlight;
    send(Lcd.Command, 0);
  }

  

  /**
   * Connects to the LCD at a given I2C address.
   * The addresses 39 (PCF8574) or 63 (PCF8574A) seem to be widely used.
     */
  //% subcategory=Display
  //% blockId="lcd_set_address" block="Initialize LCD at I2C"
  //% group="LCD1602"
  //% weight=100
  export function connectLcd(): void {

    if (0 === pins.i2cReadNumber(39, NumberFormat.Int8LE, false)) {
      return;
    }

    if (lcdState && lcdState.refreshIntervalId) {
      control.clearInterval(lcdState.refreshIntervalId, control.IntervalMode.Timeout)
      lcdState.refreshIntervalId = undefined
    }

    lcdState = {
      i2cAddress: 39,
      backlight: LcdBacklight.On,
      columns: 0,
      rows: 0,
      characters: undefined,
      lineNeedsUpdate: 0,
      refreshIntervalId: undefined,
    };

    // Wait 50ms before sending first command to device after being powered on
    basic.pause(50);

    // Pull both RS and R/W low to begin commands
    pins.i2cWriteNumber(
      lcdState.i2cAddress,
      lcdState.backlight,
      NumberFormat.Int8LE
    );
    basic.pause(50);

    // Set 4bit mode
    write4bits(0x30);
    control.waitMicros(4100);
    write4bits(0x30);
    control.waitMicros(4100);
    write4bits(0x30);
    control.waitMicros(4100);
    write4bits(0x20);
    control.waitMicros(1000);

    // Configure function set
    const LCD_FUNCTIONSET = 0x20;
    const LCD_4BITMODE = 0x00;
    const LCD_2LINE = 0x08; // >= 2 lines
    const LCD_5x8DOTS = 0x00;
    send(Lcd.Command, LCD_FUNCTIONSET | LCD_4BITMODE | LCD_2LINE | LCD_5x8DOTS);
    control.waitMicros(1000);

    // Configure display
    const LCD_DISPLAYCONTROL = 0x08;
    const LCD_DISPLAYON = 0x04;
    const LCD_CURSOROFF = 0x00;
    const LCD_BLINKOFF = 0x00;
    send(
      Lcd.Command,
      LCD_DISPLAYCONTROL | LCD_DISPLAYON | LCD_CURSOROFF | LCD_BLINKOFF
    );
    control.waitMicros(1000);

    // Set the entry mode
    const LCD_ENTRYMODESET = 0x04;
    const LCD_ENTRYLEFT = 0x02;
    const LCD_ENTRYSHIFTDECREMENT = 0x00;
    send(
      Lcd.Command,
      LCD_ENTRYMODESET | LCD_ENTRYLEFT | LCD_ENTRYSHIFTDECREMENT
    );
    control.waitMicros(1000);
  }

  /**
   * Returns true if a LCD is connected. False otherwise.
   */
  //% subcategory=Display
  //% blockId="lcd_is_connected" block="LCD is connected"
  //% weight=69
  //% group="LCD1602"
  //% blockHidden=true
  export function isLcdConnected(): boolean {
    return !!lcdState || connect();
  }


}
