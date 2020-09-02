#!/usr/bin/env node
const spawn = require("cross-spawn")

const program = require("commander")
const packageJson = require("../package.json")
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
  .command("docker")
  .arguments("[env...]")
  .description("docker build image")
  .action(env => {
    GoSpawn("docker", env)
  })

program
  .command("build")
  .arguments("[env...]")
  .description("build project")
  .action(env => {
    GoSpawn("build", env)
  })

program
  .command("start")
  .arguments("[env...]")
  .description("start a dev server")
  .action(env => {
    // if (env.length > 1) {
    //   console.log("Only one is Supported for now.")
    //   return
    // } else {
    GoSpawn("start", env)
    // }
  })

program
  .command("server")
  .arguments("[env...]")
  .description("build server project")
  .action(env => {
    // if (env.length > 1) {
    //   console.log("Only one is Supported for now.")
    //   return
    // } else {
    GoSpawn("server", env)
    // }
  })

program.on("command:*", function() {
  console.error(
    "Invalid command: %s\nSee --help for a list of available commands.",
    program.args.join(" ")
  )
  process.exit(1)
})

program.parse(process.argv)
