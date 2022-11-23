import { DEFAULT_MATERIAL_DATA } from "dataset/materials"
import JSZip from "jszip"
import * as THREE from "three"
import ArrayBufferToBase64 from "./ArrayBufferToBase64"
import RgbToHex from "./RgbToHex"

/**
 * ArrayBuffer
 * @param {Object} data
 * @returns
 */
export default function ParseMaterialFile(data) {
  const file = new Blob([data], { type: "application/zip" })
  return new Promise((resolve, reject) => {
    new JSZip().loadAsync(file).then(zip => {
      let zipEntries = Object.keys(zip.files)
      let zipFiles = zipEntries.map(entry => zip.files[entry])
      let zipData = zipFiles.map(file => file.async("arraybuffer"))
      Promise.all(zipData)
        .then(data => {
          //Default material data
          const materialData = Object.assign({}, DEFAULT_MATERIAL_DATA)

          //Parse u3m
          if (zipEntries.some(entry => entry.endsWith(".u3m"))) {
            materialData.type = "u3m"

            const idx = zipEntries.findIndex(entry => entry.endsWith(".u3m"))
            const u3mJson = JSON.parse(new TextDecoder().decode(data[idx]))
            const front = u3mJson.material.front
            if (front) {
              //Color
              materialData.color = RgbToHex(front.basecolor.constant)

              //Map
              const setMap = () => {
                let path = front.basecolor.texture.image.path.replaceAll(
                  /\\/g,
                  "/",
                )
                const arraybuffer =
                  data[zipEntries.findIndex(entry => entry === path)]
                const base64 = ArrayBufferToBase64(arraybuffer)
                const image = new Image()
                image.src = base64
                const texture = new THREE.Texture()
                texture.image = image
                image.onload = () => {
                  texture.needsUpdate = true
                }

                materialData.map = texture
              }

              if (front.basecolor.texture) {
                setMap()
              }

              //Normal Map
              const setNormalMap = () => {
                let path = front.normal.texture.image.path.replaceAll(
                  /\\/g,
                  "/",
                )
                const arraybuffer =
                  data[zipEntries.findIndex(entry => entry === path)]
                const base64 = ArrayBufferToBase64(arraybuffer)
                const image = new Image()
                image.src = base64
                const texture = new THREE.Texture()
                texture.image = image
                image.onload = () => {
                  texture.needsUpdate = true
                }

                materialData.normalMap = texture
              }

              if (front.normal.texture) {
                setNormalMap()
              }

              //Displacement Map
              const setDisplacementMap = () => {
                let path = front.displacement.texture.image.path.replaceAll(
                  /\\/g,
                  "/",
                )
                const arraybuffer =
                  data[zipEntries.findIndex(entry => entry === path)]
                const base64 = ArrayBufferToBase64(arraybuffer)
                const image = new Image()
                image.src = base64
                const texture = new THREE.Texture()
                texture.image = image
                image.onload = () => {
                  texture.needsUpdate = true
                }

                materialData.displacementMap = texture
              }

              if (front.displacement.texture) {
                setDisplacementMap()
              }

              //Roughness Map
              const setRoughnessMap = () => {
                let path = front.roughness.texture.image.path.replaceAll(
                  /\\/g,
                  "/",
                )
                const arraybuffer =
                  data[zipEntries.findIndex(entry => entry === path)]
                const base64 = ArrayBufferToBase64(arraybuffer)
                const image = new Image()
                image.src = base64
                const texture = new THREE.Texture()
                texture.image = image
                image.onload = () => {
                  texture.needsUpdate = true
                }

                materialData.roughnessMap = texture
                materialData.roughness = front.roughness.constant
              }

              if (front.roughness.texture) {
                setRoughnessMap()
              }

              //Metalness Map
              const setMetalnessMap = () => {
                let path = front.metalness.texture.image.path.replaceAll(
                  /\\/g,
                  "/",
                )
                const arraybuffer =
                  data[zipEntries.findIndex(entry => entry === path)]
                const base64 = ArrayBufferToBase64(arraybuffer)
                const image = new Image()
                image.src = base64
                const texture = new THREE.Texture()
                texture.image = image
                image.onload = () => {
                  texture.needsUpdate = true
                }

                materialData.metalnessMap = texture
                materialData.metalness = front.metalness.constant
              }

              if (front.metalness.texture) {
                setMetalnessMap()
              }

              //Alpha Map
              const setAlphaMap = () => {
                let path = front.alpha.texture.image.path.replaceAll(/\\/g, "/")
                const arraybuffer =
                  data[zipEntries.findIndex(entry => entry === path)]
                const base64 = ArrayBufferToBase64(arraybuffer)
                const image = new Image()
                image.src = base64
                const texture = new THREE.Texture()
                texture.image = image
                image.onload = () => {
                  texture.needsUpdate = true
                }

                materialData.metalnessMap = texture
              }

              if (front.alpha.texture) {
                setAlphaMap()
              }
            }
          }

          resolve(materialData)
        })
        .catch(error => {
          reject(error)
        })
    })
  })
}
