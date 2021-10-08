//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract BMPGenerator {
    string private greeting;

    uint24[16][] public _palettes;
    uint8[32*32] public _template;

    constructor() {

    }

    function setTemplate(uint8[32*32] memory newTemplate) public returns (string memory) {
        _template = newTemplate;
    }

    function getBMP() public view returns (uint24[32*32] memory bmp) {
        uint256 gasBefore = gasleft();
        uint24[16] memory palette = _palettes[0];

        for (uint256 y = 0; y < 32; y++) {
            uint yPos = 32 * y;
            for (uint256 x = 0; x < 32; x++) {
                bmp[yPos + x] = palette[_template[yPos + x]];
            }
        }
        uint256 gasAfter = gasleft();
        console.log("gas used: %d", gasBefore - gasAfter);
    }

    function getBMPFromTemplate(
        uint8[32*32] memory template,
        uint24[16] memory palette
    ) public pure returns (uint24[32*32] memory bmp) {
        for (uint256 y = 0; y < 32; y++) {
            uint yPos = 32 * y;
            for (uint256 x = 0; x < 32; x++) {
                bmp[yPos + x] = palette[template[yPos + x]];
            }
        }
    }


//    function getPaletteColor(uint24[] palette) public view returns (uint24) {
//        return 
//    }

    function addPalette(uint24[16] memory palette) public {
        _palettes.push(palette);
    }
}
