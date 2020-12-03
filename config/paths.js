const path = require("path")
const fs = require("fs")

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)

module.exports = {
  dockerfileServer: path.resolve(__dirname, "../docker/server/Dockerfile"),
  dockerfileClient: path.resolve(__dirname, "../docker/client/Dockerfile"),
  tsconfig: resolveApp("tsconfig.json"),
  userConfig: resolveApp("femi.json"),
  output: resolveApp("dist" + (process.env.PUBLIC_URL || "")),
  html: resolveApp("public/index.html"),
  appDirectory,
  resolveApp,
}
