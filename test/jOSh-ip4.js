function Glados () {
    this.version = 2112

    this.init = function () {
        var msg = "Custom tests for jOSh.\n"
        alert(msg)
    }

    this.afterStartup = function () {
        _KernelInputQueue.enqueue('f')
        _KernelInputQueue.enqueue('o')
        _KernelInputQueue.enqueue('r')
        _KernelInputQueue.enqueue('m')
        _KernelInputQueue.enqueue('a')
        _KernelInputQueue.enqueue('t')
        TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false])

        // Test a file name that is invalid
        _KernelInputQueue.enqueue('c')
        _KernelInputQueue.enqueue('r')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue('a')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue(' ')
        _KernelInputQueue.enqueue('~')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue('s')
        _KernelInputQueue.enqueue('t')
        TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false])

        // Test a file name that is too long
        _KernelInputQueue.enqueue('c')
        _KernelInputQueue.enqueue('r')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue('a')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue(' ')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false])

        // Test a file name of the perfect size
        _KernelInputQueue.enqueue('c')
        _KernelInputQueue.enqueue('r')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue('a')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue(' ')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        _KernelInputQueue.enqueue('A')
        TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false])

        _KernelInputQueue.enqueue('c')
        _KernelInputQueue.enqueue('r')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue('a')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue(' ')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue('s')
        _KernelInputQueue.enqueue('t')
        TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false])

        _KernelInputQueue.enqueue('c')
        _KernelInputQueue.enqueue('r')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue('a')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue(' ')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue('s')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('1')
        TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false])

        // Test file that already exists
        _KernelInputQueue.enqueue('c')
        _KernelInputQueue.enqueue('r')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue('a')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue(' ')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue('s')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('1')
        TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false])

        _KernelInputQueue.enqueue('c')
        _KernelInputQueue.enqueue('r')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue('a')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue(' ')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('e')
        _KernelInputQueue.enqueue('s')
        _KernelInputQueue.enqueue('t')
        _KernelInputQueue.enqueue('2')
        TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false])

        // Test ls command
        _KernelInputQueue.enqueue('l')
        _KernelInputQueue.enqueue('s')
        TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false])

        setTimeout(() => {
            // Get a fresh disk
            _KernelInputQueue.enqueue('f')
            _KernelInputQueue.enqueue('o')
            _KernelInputQueue.enqueue('r')
            _KernelInputQueue.enqueue('m')
            _KernelInputQueue.enqueue('a')
            _KernelInputQueue.enqueue('t')
            TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false])
        }, 3000)

        setTimeout(() => {
            // Test boundary for a full directory
            for (let i = 0; i < 64; i++) {
                _KernelInputQueue.enqueue('c')
                _KernelInputQueue.enqueue('r')
                _KernelInputQueue.enqueue('e')
                _KernelInputQueue.enqueue('a')
                _KernelInputQueue.enqueue('t')
                _KernelInputQueue.enqueue('e')
                _KernelInputQueue.enqueue(' ')
                _KernelInputQueue.enqueue('t')
                _KernelInputQueue.enqueue('e')
                _KernelInputQueue.enqueue('s')
                _KernelInputQueue.enqueue('t')
                _KernelInputQueue.enqueue(i.toString())
                TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false])
            }
        }, 4000)
    }
}
