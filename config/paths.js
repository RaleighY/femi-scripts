const path = require("path")
const fs = require("fs")

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)
const PackageJson = require(resolveApp("package.json"))

// 未指定入口
if (!PackageJson.entry) {
  console.log('请在package.json中添加"entry":"你的入口路径"。')
  process.exit(0)
}

const Entry = Object.keys(PackageJson.entry)
  .map(appKey => {
    return { [`Entry_${appKey}`]: resolveApp(PackageJson.entry[appKey]) }
  })
  .reduce((prev, current) => {
    return Object.assign(prev, current)
  })

module.exports = Object.assign(Entry, {
  PackageJson: resolveApp("package.json"),
  Output: resolveApp("dist" + (process.env.PUBLIC_URL || "")),
  Html: resolveApp("public/index.html"),
  Favicon: resolveApp("public/favicon.png"),
})
