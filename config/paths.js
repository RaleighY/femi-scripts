const path = require("path")
const fs = require("fs")

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)
const Config = require(resolveApp("femi.json"))

// 未指定入口
if (!Config.entry) {
  console.log('请在 femi.json 中添加"entry":"你的入口路径"。')
  process.exit(0)
}

const Entry = Object.keys(Config.entry)
  .map(appKey => {
    return { [`Entry_${appKey}`]: resolveApp(Config.entry[appKey]) }
  })
  .reduce((prev, current) => {
    return Object.assign(prev, current)
  })

module.exports = Object.assign(Entry, {
  DockerfileServer: path.resolve(__dirname, "../docker/server/Dockerfile"),
  DockerfileClient: path.resolve(__dirname, "../docker/client/Dockerfile"),
  Config: resolveApp("femi.json"),
  Output: resolveApp("dist" + (process.env.PUBLIC_URL || "")),
  Html: resolveApp("public/index.html"),
  Favicon: resolveApp("public/favicon.png"),
})
