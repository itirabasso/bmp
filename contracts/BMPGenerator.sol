//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract BMPGenerator {
    string private greeting;

    uint24[16][] private _palettes;
    uint256[32][] private _templates;

    function getBMP(uint256 templateId, uint256 paletteId)
        public
        view
        returns (uint24[32 * 32] memory bmp)
    {
        uint256 gasBefore = gasleft();
        uint256[32] storage template = getTemplate(templateId);
        uint24[16] storage palette = getPalette(paletteId);
        bmp = generateBMP(template, palette);

        uint256 gasAfter = gasleft();
        console.log("gas used: %d", gasBefore - gasAfter);
    }

    // todo : support rgba
    function generateBMP(uint8[32][] memory template, uint24[16] memory palette)
        public
        view
        returns (uint24[32 * 32] memory bmp)
    {
        uint8 colorIndex;
        // trim would be useful here
        for (uint256 y = 0; y < 32; y++) {
            uint256 yPos = 32 * y;
            uint256 row = template[y];
            for (uint256 x = 0; x < 32; x++) {
                colorIndex = uint8(
                    uint256(row & (0xff << (x * 8))) >> (x * 8)
                );
                // uint24 rgb = palette[colorIndex];
                // console.log('pos %d', yPos+x);
                bmp[yPos + x] = uint24(palette[colorIndex]);
            }
        }
    }

    // pack it
    function getTemplate(uint256 templateId)
        internal
        view
        returns (uint256[32] storage template)
    {
        template = _templates[templateId];
    }

    function getPalette(uint256 paletteId)
        internal
        view
        returns (uint24[16] storage)
    {
        uint24[16] storage palette = _palettes[paletteId];
        return palette;
    }

    // counters

    function addTemplate(uint256[32] memory newTemplate) external {
        // read evm of this line
        _templates.push(newTemplate);
    }

    function addPalette(uint24[16] memory palette) external {
        _palettes.push(palette);
    }
}
