var TSOS;
(function (TSOS) {
    class MemoryManager {
        // Places the program into memory and returns the segment the program was placed in
        allocateProgram(program) {
            // Get the PCBs for programs allocated in memory
            let allocatedPrograms = _PCBHistory.filter(pcb => pcb.segment !== -1);
            // We can immediately flash the program if nothing has been allocated yet
            // And only use segment 0 for now
            if (allocatedPrograms.length === 0) {
                _MemoryAccessor.flashProgram(program, 0x0100);
                return 1;
            }
            for (const allcatedProg of allocatedPrograms) {
                if (allcatedProg.status === 'Terminated') {
                    // Replace the program in memory
                    _MemoryAccessor.flashProgram(program, allcatedProg.baseReg);
                    let savedSegment = allcatedProg.segment;
                    // Update the segment allocated to the program because it is done and no longer in memory
                    allcatedProg.segment = -1;
                    allcatedProg.updateTableEntry();
                    // Return the segment the program was placed in memory (only 0 for now)
                    return savedSegment;
                }
            }
            // Unable to place the program in memory
            return -1;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map