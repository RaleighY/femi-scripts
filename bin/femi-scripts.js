#!/usr/bin/env node
const spawn = require("cross-spawn")

const program = require("commander")
const packageJson = require("../package.json")
const start = require("../scripts/start")
const build = require("../scripts/build")
const docker = require("../scripts/docker")
const server = require("../scripts/server")

program.version(packageJson.version)

program
  .command("build")
  .option("-s, --system", "build target system")
  .arguments("[env...]")
  .description("build project")
  .action((env, obj) => {
    build({ appEntry: env[0], isSystem: obj.system })
  })

program
  .command("start")
  .option("-s, --system", "build target system")
  .arguments("[env...]")
  .description("start a dev server")
  .action((env, obj) => {
    start({ appEntry: env[0], isSystem: obj.system })
  })

program
  .command("docker <imageType> <imageName>")
  .arguments("[env...]")
  .description("docker build image")
  .action((imageType, imageName) => {
    docker({ imageType, imageName })
  })

program
  .command("server")
  .arguments("[env...]")
  .description("build server project")
  .action(env => {
    server()
  })

program.on("command:*", function() {
  console.error(
    "Invalid command: %s\nSee --help for a list of available commands.",
    program.args.join(" ")
  )
  process.exit(1)
})

program.parse(process.argv)
