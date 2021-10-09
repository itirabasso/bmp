import { ethers } from "hardhat";
import Jimp from "jimp";

async function main() {

  const BMP = await ethers.getContractFactory("BMPGenerator");
  const bmp = await BMP.deploy();
  await bmp.deployed();

  console.log("BMP deployed to:", bmp.address);

  const template: any = []
  const palette: any = []
  const c: any = []
  // Jimp.read('./scripts/gem4.bmp', async (err, gem) => {
  //   if (err) console.error('muerte')
  //   // get colors
  //   for (let i = 0; i < gem.bitmap.data.length; i += 4) {
  //     const [r, g, b, a] = [
  //       gem.bitmap.data.readUInt8(i),
  //       gem.bitmap.data.readUInt8(i + 1),
  //       gem.bitmap.data.readUInt8(i + 2),
  //       gem.bitmap.data.readUInt8(i + 3)
  //     ]
  //     // if (r + g + b > 240 * 3 || r + g + b < 10) continue
  //     // console.log(r,g,b)
  //     if (!c.includes(r + g + b)) {
  //       c.push(r + g + b)
  //       palette.push([r, g, b])
  //     }
  //   }
  //   // console.log(palette)

  //   // reds (but all colors are the same because of greyscale)
  //   const rs = palette.map(([r, g, b]: any) => r)
  //   const sortedReds = rs.sort((a: number, b: number) => {
  //     return a - b;
  //   });

  //   // create template of indexed colors
  //   for (let i = 0; i < gem.bitmap.data.length; i += 4) {
  //     // only want to read the color red
  //     const [r, g, b, a] = [
  //       gem.bitmap.data.readUInt8(i),
  //       gem.bitmap.data.readUInt8(i + 1),
  //       gem.bitmap.data.readUInt8(i + 2),
  //       gem.bitmap.data.readUInt8(i + 3)
  //     ]
  //     // set the indexed color
  //     template.push(sortedReds.indexOf(r))
  //   }
  //   // console.log(template)
  //   await bmp.setTemplate(template)
  //   console.log('b', Date.now())
  //   await bmp.addPalette(
  //     [
  //       [10, 10, 54],
  //       [10, 32, 54],
  //       [10, 32, 74],
  //       [10, 74, 74],
  //       [32, 74, 86],
  //       [54, 74, 96],
  //       [64, 84, 96],
  //       [74, 96, 96],
  //       [0, 0, 0],
  //       [0, 0, 0],
  //       [0, 0, 0],
  //       [0, 0, 0],
  //       [0, 0, 0],
  //       [0, 0, 0],
  //       [0, 0, 0],
  //       [0, 0, 0]
  //     ]
  //   )
  //   console.log('c', Date.now())
  //   console.log(await bmp.getBMP())
  //   console.log('d', Date.now())
  // });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
