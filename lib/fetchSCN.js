const fs = require("fs")
const path = require("path")

module.exports = function(dirPath) {
  new Promise((resolve, reject) => {
    fs.stat(dirPath, (err, stats) => {
      if (err) {
        reject(err)
      } else {
        resolve(stats)
      }
    })
  }).then(
    stats => {
      if (stats && stats.isDirectory()) {
        const cleanRegexp = /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm

        if (!fs.existsSync("./node_modules/normalize.css/package.json")) {
          console.log("ERROR: You should Install normalize.css")
          return
        }

        const normalizePackage = JSON.parse(
          fs.readFileSync("./node_modules/normalize.css/package.json", "utf8")
        )
        const normalizeMain = path.join("./node_modules/normalize.css", normalizePackage.main)
        const normalizeContent = fs.readFileSync(normalizeMain, "utf8")

        const cleanedContent = normalizeContent
          .replace(cleanRegexp, "")
          .replace(/^\s*\n/gm, "")
          .replace(/\s+$/gm, "")

        const resultContent = `import { css, createGlobalStyle } from 'styled-components'
          export const normalize = css\`
          ${cleanedContent}
          \`
          export const Normalize = createGlobalStyle\`\${normalize}\`
          export default Normalize
        `
        fs.writeFileSync(
          path.resolve(fs.realpathSync(process.cwd()), dirPath + "index.ts"),
          resultContent
        )
      } else {
        console.log("ERROR: " + dirPath + " is not a directory.")
      }
    },
    err => {
      console.log("ERROR: " + err)
    }
  )
}
