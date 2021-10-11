import { ethers } from "hardhat";
import { task } from "hardhat/config";
import Jimp from "jimp";

import { createCanvas, ImageData, Image } from 'canvas';
import { BigNumber, BigNumberish } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { formatEther } from "ethers/lib/utils";

const bytesToRGB = (r: number, g: number, b: number): number => {
  return BigNumber.from(b).shl(16)
    .add(BigNumber.from(g).shl(8))
    .add(BigNumber.from(r)).toNumber()
}

const RGBtoBytes = (rgb: number): BigNumberish => {
  return [rgb & 0xff, (rgb & 0xff00) >> 8, (rgb & 0xff0000) >> 16]
}

const bytesToRow = (uint8s: number[], width: number) => {

}

const generatorAddress = '0x4EE6eCAD1c2Dae9f525404De8555724e3c35d07B'
task('deploy').setAction(async (args, env) => {
  await env.run('compile')
  const BMP = await env.ethers.getContractFactory("BMPGenerator");
  console.log('Deploying BMP')
  const bmp = await BMP.deploy();
  await bmp.deployed();

  console.log("BMP deployed to:", bmp.address);
  return bmp
})

task('full').setAction(async (args, env) => {
  const bmp = await env.run('deploy')

  await env.run('set-template', {
    bmp: bmp.address
  })
  await env.run('set-palette', {
    bmp: bmp.address
  })

  console.log("BMP deployed to:", bmp.address);

})

task('get-bmp')
  .setAction(async (args, { ethers }) => {
    const bmp = await ethers.getContractAt('BMPGenerator', generatorAddress)
    console.log(await bmp.getBMP(0, 0))
  })

task('add-template')
  .addOptionalParam('file')
  .addOptionalParam('bmp')
  .setAction(async (args, { ethers }) => {
    // initialize palette with reserved colors
    const indexedColors = [
      [0, 0, 0]
    ]
    const bmp = await ethers.getContractAt('BMPGenerator', args.bmp || generatorAddress)

    const gem = await Jimp.read(args.file || './scripts/gem.bmp')

    const greyTemplate: number[] = []
    for (let i = 0; i < gem.bitmap.data.length; i += 4) {
      // pixel_i
      const [r, g, b, a] = [
        gem.bitmap.data.readUInt8(i),
        gem.bitmap.data.readUInt8(i + 1),
        gem.bitmap.data.readUInt8(i + 2),
        gem.bitmap.data.readUInt8(i + 3)
      ]
      // console.log(r,g,b)
      if (indexedColors.findIndex((rgb: any) => rgb[0] == r) === -1) {
        console.log(r, '=>', [r, g, b])
        indexedColors.push([r, g, b])
      }
    }

    console.log(indexedColors)

    const template: any = []
    // create template of indexed colors
    const bitmap = gem.bitmap
    for (let y = 0; y < 32; y++) {
      let row = BigNumber.from(0)
      let yPos = y * 32
      for (let x = 0; x < 32; x++) {
        const [r, g, b, a] = [
          bitmap.data.readUInt8(yPos*4 + x*4),
          bitmap.data.readUInt8(yPos*4 + x*4 + 1),
          bitmap.data.readUInt8(yPos*4 + x*4 + 2),
          bitmap.data.readUInt8(yPos*4 + x*4 + 3)
        ]
        const colorIndex = indexedColors.findIndex(
          (rgb: any) => rgb[0] == r
        )
        // console.log(rgba, row)

        row = row.or(BigNumber.from(colorIndex).shl(x*8))
        // set the indexed color
        // template.push(Object.values(indexedColors).indexOf(r))
        // template.push(colorIndex)
      }
      console.log(row.toHexString())
      template.push(row)
    }
    // console.log(template)
    const tx = await bmp.addTemplate(template)
    const receipt = await tx.wait()
    console.log(receipt.gasUsed.toNumber())
  })

task('add-palette')
  .addOptionalParam('bmp')
  .setAction(async (args, { ethers }) => {
    const bmp = await ethers.getContractAt('BMPGenerator', args.bmp || generatorAddress)
    const tx = await bmp.addPalette([
      bytesToRGB(0, 0, 0),
      bytesToRGB(255, 255, 255),
      bytesToRGB(1, 1, 1),
      bytesToRGB(158, 246, 246),
      bytesToRGB(180, 218, 252),
      bytesToRGB(136, 192, 247),
      bytesToRGB(80, 182, 244),
      bytesToRGB(0, 192, 224),
      bytesToRGB(32, 82, 190),
      bytesToRGB(32, 80, 138),
      bytesToRGB(32, 32, 128),
      0,
      0,
      0,
      0,
      0,
    ])

    await tx.wait()
  })


  // const palette = [
  //   [10, 10, 54],
  //   [10, 32, 54],
  //   [10, 32, 74],
  //   [10, 74, 74],
  //   [32, 74, 86],
  //   [54, 74, 96],
  //   [64, 84, 96],
  //   [74, 96, 96],
  //   [0, 0, 0],
  //   [0, 0, 0],
  //   [0, 0, 0],
  //   [0, 0, 0],
  //   [0, 0, 0],
  //   [0, 0, 0],
  //   [0, 0, 0],
  //   [0, 0, 0]
  // ]