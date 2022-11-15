module TSOS {

    // Extends DeviceDriver
    export class DiskSystemDeviceDriver extends DeviceDriver {

        // Flag for if the disk has been formatted yet
        private isFormatted: boolean;

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnDsDriverEntry;

            this.isFormatted = false;
        }

        public krnDsDriverEntry() {
            // Initialization routine for this, the kernel-mode disk system Device Driver.
            this.status = "loaded";
            // More?
        }

        public formatDisk() {
            for (let t: number = 0; t < NUM_TRACKS; t++) {
                for (let s: number = 0; s < NUM_SECTORS; s++) {
                    for (let b: number = 0; b < NUM_BLOCKS; b++) {
                        // Set each block to be 0s
                        // 2 * block size is the number of 0s needed because 2 hex digits is 1 byte
                        sessionStorage.setItem(`${t}:${s}:${b}`, '0'.repeat(2 * BLOCK_SIZE));
                    }
                }
            }
            this.updateTable();
            this.isFormatted = true;
        }

        // Possible outputs
        // 0: File created successfully
        // 1: Disk is not formatted yet
        // 2: File already exists
        // 3: No available directory blocks
        // 4: No available data blocks
        public createFile(fileName: string): number {
            // Assume the file is successfully created
            let out: number = 0;

            if (!this.isFormatted) {
                out = 1;
            } else {
                // Initialize the first open directory spot to be an empty string because nothing is there yet
                let firstOpenDir: string = '';
                for (let s = 0; s < NUM_SECTORS && out === 0; s++) {
                    for (let b = 0; b < NUM_BLOCKS && out === 0; b++) {
                        if (s === 0 && b === 0) {
                            // 0:0:0 is for the master boot record
                            // Directory is 0:0:1 - 0:1:7
                            continue;
                        }

                        let blockEntry: string = sessionStorage.getItem(`0:${s}:${b}`);

                        // The block is unavailable, so check to make sure the file doesn't already exist
                        if (blockEntry.charAt(1) === '1') {
                            // Get the remaining 60 bytes of data
                            let fileMetadata: string = blockEntry.substring(8);

                            // Work to get the file name by going byte by byte through the data
                            let fileNameCheck: string = '';
                            let charIndex = 0;
                            let endFound: boolean = false;

                            while (charIndex < fileMetadata.length && !endFound) {
                                // Get the character code stored at the given byte
                                let nextCharCode: number = parseInt(fileMetadata.substring(charIndex, charIndex + 2), 16);
                                
                                if (nextCharCode === 0) {
                                    // End of file name
                                    endFound = true;
                                } else {
                                    // Continue with the next character in the file name
                                    fileNameCheck += String.fromCharCode(nextCharCode);
                                    charIndex += 2;
                                }
                            }

                            // Make sure the names do not match
                            if (fileName === fileNameCheck) {
                                out = 2;
                            }

                        } else if (firstOpenDir === '') {
                            // Set the first open directory space accordingly
                            firstOpenDir = `0:${s}:${b}`;
                        }
                    }
                }

                let firstOpenData: string = '';
                // Data blocks start in track 1
                for (let t: number = 1; t < NUM_TRACKS && firstOpenData === ''; t++) {
                    for (let s: number = 0; s < NUM_SECTORS && firstOpenData === ''; s++) {
                        for (let b: number = 0; b < NUM_BLOCKS && firstOpenData === ''; b++) {
                            // The inUse byte is the first byte, but only need the second digit
                            let inUse: string = sessionStorage.getItem(`${t}:${s}:${b}`).charAt(1);
                            // 0 means it is available
                            if (inUse === '0') {
                                firstOpenData = `${t}:${s}:${b}`;
                            }
                        }
                    }
                }

                if (out === 0) {
                    if (firstOpenDir === '') {
                        // Return an error code if no available directory space
                        out = 3;
                    } else if (firstOpenData === '') {
                        // Return an error code if no available data blocks
                        out = 4;
                    } else {
                        // Start with marking the directory entry as unavailable
                        let directoryEntry: string = '01';
                        
                        // Go through every other character in the open data (t:s:b)
                        for (let i: number = 0; i < firstOpenData.length; i += 2) {
                            directoryEntry += '0' + firstOpenData.charAt(i);
                        }

                        // Add each character of the file name to the directory entry
                        for (let j: number = 0; j < fileName.length; j++) {
                            directoryEntry += fileName.charCodeAt(j).toString(16).padStart(2, '0').toUpperCase();
                        }
                        // Pad the rest with 0s (should be at least 2)
                        directoryEntry = directoryEntry.padEnd(BLOCK_SIZE * 2, '0');

                        // Save it on the disk and update the table
                        sessionStorage.setItem(firstOpenDir, directoryEntry);

                        // Mark the data block as unavailable, give it the end of the file, and the data are all 0s
                        sessionStorage.setItem(firstOpenData, '01FFFFFF'.padEnd(BLOCK_SIZE * 2, '0'));
                        this.updateTable();
                    }
                }
            }

            return out;
        }

        // Possible outputs
        // 0: Write successful
        // 1: Disk is not formatted yet
        // 2: File not found
        // 3: Partial write (need more space)
        // 4: Internal error (file block given is available)
        public writeFile(fileName: string, contents: string): number {
            let out: number = 0;

            if (!this.isFormatted) {
                // Disk is not formatted
                out = 1;
            } else {
                let curFileBlock: string = this.getFirstDataBlockForFile(fileName);
                if (curFileBlock === '') {
                    // File was not found
                    out = 2;
                } else {
                    let contentsHex: string = '';
                    for (let i: number = 0; i < contents.length; i++) {
                        // Add the hex representation of each character to the file contents
                        contentsHex += contents.charCodeAt(i).toString(16).padStart(2, '0').toUpperCase();
                    }

                    // Add the EOF operator to the end of the contents hex string
                    contentsHex += '00';

                    // Write until there is nothing left to write
                    let remainingContents: string = contentsHex;
                    while (remainingContents.length > 0 && out === 0) {
                        if (sessionStorage.getItem(curFileBlock).charAt(1) === '0') {
                            // The block should always be available
                            out = 4;
                        } else {
                            // Separate the first 60 "bytes" of data and the remaining data
                            let contentsToWrite: string = remainingContents.substring(0, (BLOCK_SIZE - 4) * 2).padEnd((BLOCK_SIZE - 4) * 2, '0');
                            remainingContents = remainingContents.substring((BLOCK_SIZE + 4) * 2);

                            // Write the contents to the file
                            sessionStorage.setItem(curFileBlock, sessionStorage.getItem(curFileBlock).substring(0, 8) + contentsToWrite);

                            // Check to see if there is still more to write
                            if (remainingContents.length > 0) {
                                // FIXME ONLY RUN THIS FUNCTION IF THE NEXT TSB IS F:F:F
                                // OTHERWISE USE THE NEXT TSB
                                let newTsb: string = this.getFirstAvailableDataBlock();
                                // Check if the next block was found or not
                                if (newTsb === '') {
                                    // Remove the last byte to replace with an EOF operator
                                    sessionStorage.setItem(curFileBlock, sessionStorage.getItem(curFileBlock).substring(0, BLOCK_SIZE * 2 - 2) + '00');
                                    out = 3;
                                } else {
                                    // Update the current file block with the new link
                                    let updatedFileBlock: string = sessionStorage.getItem(curFileBlock).substring(0, 2) + '0' + newTsb.charAt(0) + '0' + newTsb.charAt(2) + '0' + newTsb.charAt(4) + sessionStorage.getItem(curFileBlock).substring(8);
                                    sessionStorage.setItem(curFileBlock, updatedFileBlock);

                                    // Set the status of the new block to be in use and as the end of the file
                                    // FIXME Do not overwrite the next TSB
                                    sessionStorage.setItem(newTsb, '01' + sessionStorage.getItem(newTsb).substring(2, 8) + '0'.repeat((BLOCK_SIZE - 4) * 2));

                                    // Set the current TSB to the new TSB
                                    curFileBlock = newTsb;
                                }
                            } else {
                                // TODO Write how to end the file
                                // TODO Handle memory leaks
                                // TODO Write set next TSB to F:F:F
                            }
                        }
                    }
                }
                // Update the HTML and return the status code
                this.updateTable();
            }
            return out;
        }

        public getFileList(): string[] {
            let fileList: string[] = [];

            if (this.isFormatted) {
                for (let s: number = 0; s < NUM_SECTORS; s++) {
                    for (let b: number = 0; b < NUM_BLOCKS; b++) {
                        if (s === 0 && b === 0) {
                            // Skip 0:0:0 (Master boot record)
                            continue;
                        }

                        // Get the directory entry
                        let directoryEntry: string = sessionStorage.getItem(`0:${s}:${b}`);

                        // Make sure the directory entry is in use
                        if (directoryEntry.charAt(1) === '1') {
                            // The hex representation of the name
                            let fileNameHex: string = directoryEntry.substring(8);
                            // The real representation of the file name
                            let fileName: string = '';
                            let endFound: boolean = false;

                            // Every 2 characters is a byte = real character
                            for (let i: number = 0; i < fileNameHex.length && !endFound; i += 2) {
                                let charCode: number = parseInt(fileNameHex.substring(i, i + 2), 16);
                                if (charCode === 0) {
                                    endFound = true;
                                } else {
                                    fileName += String.fromCharCode(charCode);
                                }
                            }

                            fileList.push(fileName);
                        }
                    }
                }
            }

            return fileList;
        }

        private getFirstDataBlockForFile(fileName: string): string {
            let outTsb: string = '';

            for (let s: number = 0; s < NUM_SECTORS && outTsb === ''; s++) {
                for (let b: number = 0; b < NUM_BLOCKS && outTsb === ''; b++) {
                    if (s === 0 && b === 0) {
                        // 0:0:0 is the MBR
                        continue;
                    }

                    let directoryEntry: string = sessionStorage.getItem(`0:${s}:${b}`);

                    // The hex representation of the name
                    let fileNameHex: string = directoryEntry.substring(8);
                    // The real representation of the file name
                    let fileNameStr: string = '';
                    let endFound: boolean = false;

                    // Every 2 characters is a byte = real character
                    for (let i: number = 0; i < fileNameHex.length && !endFound; i += 2) {
                        let charCode: number = parseInt(fileNameHex.substring(i, i + 2), 16);
                        if (charCode === 0) {
                            endFound = true;
                        } else {
                            fileNameStr += String.fromCharCode(charCode);
                        }
                    }

                    if (fileName === fileNameStr) {
                        // Establish the key of the first block of the data because we found the file in the directory
                        outTsb = `${directoryEntry.charAt(3)}:${directoryEntry.charAt(5)}:${directoryEntry.charAt(7)}`;
                    }
                }
            }
            
            return outTsb;
        }

        public getFirstAvailableDataBlock(): string {
            // The TSB to return (initialized to nothing)
            let dataTsb: string = '';

            // Go through each data block
            for (let t: number = 1; t < NUM_TRACKS && dataTsb === ''; t++) {
                for (let s: number = 0; s < NUM_SECTORS && dataTsb === ''; s++) {
                    for (let b: number = 0; b < NUM_BLOCKS && dataTsb === ''; b++) {
                        // Find the first data block that is not in use
                        if (sessionStorage.getItem(`${t}:${s}:${b}`).charAt(1) === '0') {
                            dataTsb = `${t}:${s}:${b}`;
                        }
                    }
                }
            }
            return dataTsb;
        }

        private updateTable(): void {
            if (this.isFormatted) {
                for (let t: number = 0; t < NUM_TRACKS; t++) {
                    for (let s: number = 0; s < NUM_SECTORS; s++) {
                        for (let b: number = 0; b < NUM_BLOCKS; b++) {
                            // Get the HTML element and the data from storage
                            let tableRow: HTMLTableRowElement = document.querySelector(`#t${t}s${s}b${b}`);
                            let storage: string = sessionStorage.getItem(`${t}:${s}:${b}`);
                            
                            // Iterate through each of the cells of the row, excluding the first column
                            for (let i: number = 1; i < tableRow.cells.length; i++) {
                                switch (i) {
                                case 1:
                                    // First cell is if the block is in use
                                    tableRow.cells[i].innerHTML = storage.charAt(1);
                                    break;
                                case 2:
                                    // Second cell is the next tsb for linked allocation
                                    tableRow.cells[i].innerHTML = storage.charAt(3) + ':' + storage.charAt(5) + ':' + storage.charAt(7);
                                    break;
                                case 3:
                                    // Last cell is the 60 bytes of data
                                    tableRow.cells[i].innerHTML = storage.substring(8);
                                    break;
                                }
                            }
                        }
                    }
                }
            } else {
                // Add the header to the table here because the table has not been populated yet
                document.querySelector('#diskTable').innerHTML = '<tr> <th>T:S:B</th> <th>In Use</th> <th>Next T:S:B</th> <th>Data</th> </tr>'

                // We need to create a new row in the table for each block in memory
                for (let t: number = 0; t < NUM_TRACKS; t++) {
                    for (let s: number = 0; s < NUM_SECTORS; s++) {
                        for (let b: number = 0; b < NUM_BLOCKS; b++) {
                            // Create the row element with the appropriate id
                            let newRow: HTMLTableRowElement = document.createElement('tr');
                            newRow.id = `t${t}s${s}b${b}`;

                            // Create the tsb element and add it to the row
                            let tsbElem: HTMLTableCellElement = document.createElement('td');
                            tsbElem.innerHTML = `${t}:${s}:${b}`;
                            newRow.appendChild(tsbElem);

                            // Get the current data stored in the block (should be all 0s)
                            let storage: string = sessionStorage.getItem(`${t}:${s}:${b}`);

                            // Get the in use byte (only need the second digit because 1 or 0) and add the element
                            let inUseElem: HTMLTableCellElement = document.createElement('td');
                            inUseElem.innerHTML = storage.charAt(1);
                            newRow.appendChild(inUseElem);

                            // Get the next 3 bytes for the next tsb and add the element
                            let nextTsbElem: HTMLTableCellElement = document.createElement('td');

                            // 3 bytes is 6 characters, but only need the second digit of each byte because everything only needs 1 digit
                            nextTsbElem.innerHTML = storage.charAt(3) + ':' + storage.charAt(5) + ':' + storage.charAt(7);
                            newRow.appendChild(nextTsbElem);

                            // Get the rest of the data and add the element
                            let dataElem: HTMLTableCellElement = document.createElement('td');
                            dataElem.innerHTML = storage.substring(8);
                            newRow.appendChild(dataElem);

                            // Add the row to the table
                            document.querySelector('#diskTable').appendChild(newRow);
                        }
                    }
                }
            }
        }
    }
}