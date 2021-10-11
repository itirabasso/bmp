import { internalTask, task } from "hardhat/config";
import Jimp from "jimp";

import { BigNumber, BigNumberish } from "ethers";

const bytesToRGB = (r: number, g: number, b: number): number => {
  return BigNumber.from(b).shl(16)
    .add(BigNumber.from(g).shl(8))
    .add(BigNumber.from(r)).toNumber()
}

const RGBtoBytes = (rgb: number): BigNumberish => {
  return [rgb & 0xff, (rgb & 0xff00) >> 8, (rgb & 0xff0000) >> 16]
}

function greyscale(r: number, g: number, b: number) {
  return Math.ceil(0.299 * r + 0.587 * g + 0.114 * b)
}

const generatorAddress = '0xc5a5C42992dECbae36851359345FE25997F5C42d'

task('deploy').setAction(async (args, { ethers, run }) => {
  await run('compile')

  const [_, deployer] = await ethers.getSigners()


  const BMP = await ethers.getContractFactory("BMPGenerator", deployer);
  console.log('Deploying BMP')
  const bmp = await BMP.deploy();
  await bmp.deployed();

  console.log("BMP deployed to:", bmp.address);
  return bmp
})

task('full').setAction(async (args, env) => {
  const bmp = await env.run('deploy')

  await env.run('process-bmp', {
    file: './assets/potion_color.bmp',
    bmp: bmp.address
  })

  console.log("BMP deployed to:", bmp.address);

})

task('get-url')
  .addPositionalParam('template', '', '0')
  .addPositionalParam('palette', '', '0')
  .setAction(async (args, { ethers }) => {
    const bmp = await ethers.getContractAt('BMPGenerator', generatorAddress)
    // console.log(await bmp.getBase64URL(args.template, args.palette))
    console.log(await bmp.getBMP(0, 0))
  })

task('process-bmp')
  .addOptionalParam('file')
  .addOptionalParam('bmp')
  .setAction(async (args, { ethers }) => {

    const [_, deployer] = await ethers.getSigners()

    const indexedColors: Record<number, number[]> = {};
    for (let i = 0; i < 256; i++) {
      indexedColors[i] = [0, 0, 0]
    }
    const bmp = await ethers.getContractAt(
      'BMPGenerator', 
      args.bmp || generatorAddress,
      deployer
    )

    const file = await Jimp.read(args.file)

    const greyTemplate = []
    // we use a greyscaled pixel to index every color.
    for (let i = 0; i < file.bitmap.data.length; i += 4) {
      // pixel_i
      const [r, g, b, a] = [
        file.bitmap.data.readUInt8(i),
        file.bitmap.data.readUInt8(i + 1),
        file.bitmap.data.readUInt8(i + 2),
        file.bitmap.data.readUInt8(i + 3)
      ]
      const grey = greyscale(r, g, b)
      indexedColors[grey] = [r, g, b]
      greyTemplate.push(grey)
      // console.log('grey', grey)
      // if (indexedColors.findIndex((rgb: any) => rgb[0] == r) === -1) {
      //   console.log(greyscaled, '=>', [r, g, b])
      //   indexedColors.push([r, g, b])
      // }
    }

    console.log(indexedColors)

    const template: any = []
    // create template of indexed colors
    const bitmap = file.bitmap
    for (let y = 0; y < 32; y++) {
      let row = BigNumber.from(0)
      let yPos = y * 32
      for (let x = 0; x < 32; x++) {
        const colorIndex = greyTemplate[yPos + x]
        row = row.or(BigNumber.from(colorIndex).shl(x * 8))
        // set the indexed color
        // template.push(Object.values(indexedColors).indexOf(r))
        // template.push(colorIndex)
      }
      console.log(row.toHexString())
      template.push(row)
    }
    // console.log(template)
    let tx = await bmp.addTemplate(template)
    let receipt = await tx.wait()

    const palette: any = Object.values(indexedColors).map(
      (color: number[]) => {
        const [r, g, b] = color
        return bytesToRGB(r, g, b)
      }
    )

    tx = await bmp.addPalette(palette)
    await tx.wait()
    console.log(receipt.gasUsed.toNumber())
  })

internalTask('add-template')
  .addOptionalParam('file')
  .addOptionalParam('bmp')
  .setAction(async (args, { ethers }) => {

    const [_, deployer] = await ethers.getSigners()

    // initialize palette with reserved colors
    const indexedColors = [
      [0, 0, 0]
    ]
    const bmp = await ethers.getContractAt(
      'BMPGenerator',
      args.bmp || generatorAddress,
      deployer
    )

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
          bitmap.data.readUInt8(yPos * 4 + x * 4),
          bitmap.data.readUInt8(yPos * 4 + x * 4 + 1),
          bitmap.data.readUInt8(yPos * 4 + x * 4 + 2),
          bitmap.data.readUInt8(yPos * 4 + x * 4 + 3)
        ]
        const colorIndex = indexedColors.findIndex(
          (rgb: any) => rgb[0] == r
        )
        // console.log(rgba, row)

        row = row.or(BigNumber.from(colorIndex).shl(x * 8))
        // set the indexed color
        // template.push(Object.values(indexedColors).indexOf(r))
        // template.push(colorIndex)
      }
      console.log(row.toHexString())
      template.push(row)
    }
    // console.log(template)
    // const tx = await bmp.addTemplate(template)
    // const receipt = await tx.wait()
    // console.log(receipt.gasUsed.toNumber())
  })


/*
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

    // await tx.wait()
  })
*/