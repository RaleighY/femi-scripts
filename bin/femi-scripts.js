#!/usr/bin/env node
const spawn = require("cross-spawn")

const program = require("commander")
const packageJson = require("../package.json")
const start = require("../scripts/start")
const build = require("../scripts/build")
const docker = require("../scripts/docker")

program.version(packageJson.version)

function GoSpawn(script, args) {
  const result = spawn.sync(
    "node",
    [].concat(require.resolve("../scripts/" + script)).concat(args),
    {
      stdio: "inherit",
    }
  )

  if (result.signal) {
    if (result.signal === "SIGKILL") {
      console.log(
        "The build failed because the process exited too early. " +
          "This probably means the system ran out of memory or someone called " +
          "`kill -9` on the process."
      )
    } else if (result.signal === "SIGTERM") {
      console.log(
        "The build failed because the process exited too early. " +
          "Someone might have called `kill` or `killall`, or the system could " +
          "be shutting down."
      )
    }
    process.exit(1)
  }
  process.exit(result.status)
}

program
  .command("build")
  .option("-s, --system", "build target system")
  .arguments("[env...]")
  .description("build project")
  .action((env, obj) => {
    build({ appName: env[0], isSystem: obj.system })
  })

program
  .command("start")
  .option("-s, --system", "build target system")
  .arguments("[env...]")
  .description("start a dev server")
  .action((env, obj) => {
    start({ appName: env[0], isSystem: obj.system })
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
    GoSpawn("server", env)
  })

program.on("command:*", function() {
  console.error(
    "Invalid command: %s\nSee --help for a list of available commands.",
    program.args.join(" ")
  )
  process.exit(1)
})

program.parse(process.argv)
