/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        // Variables for the memory table update to highlight the right things
        public branchTaken: boolean = false;
        public preBranchAddr: number = 0;

        // Defines where we are in the overall pipeline
        public pipelineState: PipelineState;

        // The operands for the current instruction being executed
        private operands: number[];

        // The alu for the CPU
        private _alu: TSOS.Alu;

        constructor(public PC: number = 0,
                    public IR: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

            this._alu = new Alu();
        }

        public init(): void {
            this.PC = 0;
            this.IR = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;

            // Fetch is first state
            this.pipelineState = PipelineState.FETCH;

            // Start with nothing
            this.operands = [];
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            
            switch (this.pipelineState) {
                case PipelineState.FETCH:
                    this.fetch();
                    break;
                case PipelineState.DECODE:
                    this.decode();
                    break;
                case PipelineState.EXECUTE:
                    this.execute();
                    break;
                case PipelineState.WRITEBACK:
                    this.writeback();
                    break;
            }

            // this.fetch();
            // let operands: number[] = this.decode();

            // // Make sure we have a valid instruction before trying to execute
            // if (operands !== undefined) {
            //     this.execute(operands);
            // }
        }

        // Function for fetching an instruction
        private fetch(): void {
            _Kernel.krnTrace('CPU fetch');
            // Get the instruction from memory and increment the PC
            _MemoryAccessor.setMar(this.PC);
            _MemoryAccessor.callRead();
            this.IR = _MemoryAccessor.getMdr();
            this.PC++;

            this.pipelineState = PipelineState.DECODE;
        }

        // Function for decoding the instruction
        private decode() {
            _Kernel.krnTrace('CPU decode');

            switch (this.IR) {
            // 1 operand
            case 0xA9: // LDA constant
            case 0xA2: // LDX constant
            case 0xA0: // LDY constant
            case 0xD0: // BNE
                // Get the operand
                _MemoryAccessor.setMar(this.PC);
                _MemoryAccessor.callRead();
                let op: number = _MemoryAccessor.getMdr();
                // Increment the PC
                this.PC++;
                // Return the operand
                this.operands = [op];
                break;
            
            // 2 operands
            case 0xAD: // LDA memory
            case 0x8D: // STA
            case 0x6D: // ADC
            case 0xAE: // LDX memory
            case 0xAC: // LDY memory
            case 0xEC: // CPX
            case 0xEE: // INC
                // Get the operands from memory
                _MemoryAccessor.setMar(this.PC);
                _MemoryAccessor.callRead();
                let op1: number = _MemoryAccessor.getMdr();
                this.PC++;

                _MemoryAccessor.setMar(this.PC);
                _MemoryAccessor.callRead();
                let op2: number = _MemoryAccessor.getMdr();
                this.PC++;

                // Return the operands
                this.operands = [op1, op2];
                break;
            
            // 0 operands
            case 0xEA: // NOP
            case 0x00: // BRK
            case 0xFF: // SYS
                this.operands = [];
                break;
            
            // Invalid opcode
            default:
                // Add the interrupt to kill the process and return nothing
                _KernelInterruptQueue.enqueue(new Interrupt(INVALID_OPCODE_IRQ, [this.IR]));
                this.operands = undefined;
                break;
            }

            this.pipelineState = PipelineState.EXECUTE;
        }

        // Function for executing the instruction
        private execute(): void {
            _Kernel.krnTrace('CPU execute');

            switch (this.IR) {
            case 0xA9: // LDA constant
                // Update the accumulator
                this.Acc = this.operands[0];
                break;
            case 0xAD: // LDA memory
                // Convert the operands from little endian format to a plain address
                // Since each operand is 8 bits, we can left shift the first one and do a bitwise OR
                // te combine them into one whole address
                // let readAddr: number = operands[1] << 8 | operands[0];
                _MemoryAccessor.setLowOrderByte(this.operands[0]);
                _MemoryAccessor.setHighOrderByte(this.operands[1]);
                _MemoryAccessor.callRead();
                
                // Set the accumulator to whatever is in memory at the given address
                this.Acc = _MemoryAccessor.getMdr();
                break;

            case 0x8D: // STA
                // Convert the operands from little endian format to a plain address as described in 0xAD
                // let writeAddr: number = operands[1] << 8 | operands[0];
                _MemoryAccessor.setLowOrderByte(this.operands[0]);
                _MemoryAccessor.setHighOrderByte(this.operands[1]);
                _MemoryAccessor.setMdr(this.Acc);

                // Write the accumulator to memory
                _MemoryAccessor.callWrite();
                break;

            case 0x6D: // ADC
                // Convert the operands from little endian format to a plain address as described in 0xAD
                // let addAddr: number = operands[1] << 8 | operands[0];
                _MemoryAccessor.setLowOrderByte(this.operands[0]);
                _MemoryAccessor.setHighOrderByte(this.operands[1]);
                _MemoryAccessor.callRead();

                // Get the value to add to the accumulator
                let addVal: number = _MemoryAccessor.getMdr();

                // Add the numbers together
                this.Acc = this._alu.addWithCarry(this.Acc, addVal);
                break;

            case 0xA2: // LDX constant
                // Put the operand into the x register
                this.Xreg = this.operands[0];
                break;

            case 0xAE: // LDX memory
                // Convert the operands from little endian format to a plain address as described in 0xAD
                // let xAddr: number = operands[1] << 8 | operands[0];
                _MemoryAccessor.setLowOrderByte(this.operands[0]);
                _MemoryAccessor.setHighOrderByte(this.operands[1]);
                _MemoryAccessor.callRead();

                // Set the x register to the value in memory
                this.Xreg = _MemoryAccessor.getMdr();
                break;

            case 0xA0: // LDY constant
                // Put the operand into the y register
                this.Yreg = this.operands[0];
                break;

            case 0xAC: // LDY memory
                // Convert the operands from little endian format to a plain address as described in 0xAD
                // let yAddr: number = operands[1] << 8 | operands[0];
                _MemoryAccessor.setLowOrderByte(this.operands[0]);
                _MemoryAccessor.setHighOrderByte(this.operands[1]);
                _MemoryAccessor.callRead();

                // Set the x register to the value in memory
                this.Yreg = _MemoryAccessor.getMdr();
                break;

            case 0xEA: // NOP
                // Do nothing for a no operation
                break;

            case 0x00: // BRK
                // Call an interrupt for the OS to handle to end of the program execution
                _KernelInterruptQueue.enqueue(new Interrupt(PROG_BREAK_SINGLE_IRQ, []));
                break;
            
            case 0xEC: // CPX
                // Convert the operands from little endian format to a plain address as described in 0xAD
                // let compAddr: number = operands[1] << 8 | operands[0];
                _MemoryAccessor.setLowOrderByte(this.operands[0]);
                _MemoryAccessor.setHighOrderByte(this.operands[1]);
                _MemoryAccessor.callRead();

                // Get the value in memory and negate it
                let compVal: number = _MemoryAccessor.getMdr();
                let compValNeg: number = this._alu.negate(compVal);

                // Run the values through the adder
                // The Z flag will be updated appropriately to be 1 if they are equal and 0 if not
                this._alu.addWithCarry(this.Xreg, compValNeg);
                break;

            case 0xD0: // BNE
                // Only branch if the z flag is not enabled
                if (this.Zflag === 0) {
                    // Save the state for the memory table updates
                    this.preBranchAddr = this.PC;
                    this.branchTaken = true;
                    
                    // Add the operand to the program counter
                    this.PC = this._alu.addWithCarry(this.PC, this.operands[0]);
                } else {
                    this.branchTaken = false;
                }
                break;
            
            case 0xEE: // INC
                // Convert the operands from little endian format to a plain address as described in 0xAD
                // let incAddr: number = operands[1] << 8 | operands[0];
                _MemoryAccessor.setLowOrderByte(this.operands[0]);
                _MemoryAccessor.setHighOrderByte(this.operands[1]);
                _MemoryAccessor.callRead();

                // Get the value from memory and add 1 to it
                let origVal: number = _MemoryAccessor.getMdr();
                let newVal: number = this._alu.addWithCarry(origVal, 1);

                _MemoryAccessor.setMdr(newVal);
                // Write the new value back to memory
                _MemoryAccessor.callWrite();
                break;

            case 0xFF: // SYS
                if (this.Xreg === 1) {
                    if (this.Yreg >> 7 === 1) {
                        // We have a negative number and have to put it in a usable format for base 10
                        let printableNum: number = -1 * this._alu.negate(this.Yreg);
                        // Make a system call for printing the number
                        _KernelInterruptQueue.enqueue(new Interrupt(SYSCALL_PRINT_INT_IRQ, [printableNum]));
                    } else {
                        // Make a system call for printing the number
                        _KernelInterruptQueue.enqueue(new Interrupt(SYSCALL_PRINT_INT_IRQ, [this.Yreg]));
                    }
                } else if (this.Xreg === 2) {
                    // Convert the operands from little endian format to a plain address as described in 0xAD
                    _KernelInterruptQueue.enqueue(new Interrupt(SYSCALL_PRINT_STR_IRQ, [this.Yreg]));
                }
                break;
            }

            this.pipelineState = PipelineState.WRITEBACK;
        }

        private writeback(): void {
            _Kernel.krnTrace('CPU writeback');

            this.pipelineState = PipelineState.INTERRUPTCHECK;
        }

        // Function to update the table on the website
        public updateCpuTable(): void {
            switch (this.pipelineState) {
                case PipelineState.FETCH:
                    document.querySelector('#cpuPipelineState').innerHTML = 'Fetch';
                    break;
                case PipelineState.DECODE:
                    document.querySelector('#cpuPipelineState').innerHTML = 'Decode';
                    break;
                case PipelineState.EXECUTE:
                    document.querySelector('#cpuPipelineState').innerHTML = 'Execute';
                    break;
                case PipelineState.WRITEBACK:
                    document.querySelector('#cpuPipelineState').innerHTML = 'Write-back';
                    break;
                case PipelineState.INTERRUPTCHECK:
                    document.querySelector('#cpuPipelineState').innerHTML = 'Interrupt Check';
                    break;
            }

            document.querySelector('#cpuPC').innerHTML = Utils.getHexString(this.PC, 2, false);
            document.querySelector('#cpuIR').innerHTML = Utils.getHexString(this.IR, 2, false);
            document.querySelector('#cpuAcc').innerHTML = Utils.getHexString(this.Acc, 2, false);
            document.querySelector('#cpuXReg').innerHTML = Utils.getHexString(this.Xreg, 2, false);
            document.querySelector('#cpuYReg').innerHTML = Utils.getHexString(this.Yreg, 2, false);
            document.querySelector('#cpuZFlag').innerHTML = this.Zflag.toString();
        }

        // Function to set all of the variables of the cpu at once
        public setCpuStatus(newPC: number, newIR: number, newAcc: number, newXReg: number, newYReg: number, newZFlag: number): void {
            // Update the CPU variables state
            this.PC = newPC;
            this.IR = newIR;
            this.Acc = newAcc;
            this.Xreg = newXReg;
            this.Yreg = newYReg;
            this.Zflag = newZFlag;

            this.updateCpuTable();
        }
    }
}
