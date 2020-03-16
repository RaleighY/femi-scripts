#!/usr/bin/env node
const spawn = require("cross-spawn")

// const args = process.argv.slice(2)
// const scriptIndex = args.findIndex(x => x === "build" || x === "start" || x === "test")
// const script = scriptIndex === -1 ? args[0] : args[scriptIndex]
// const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : []

// if (["build", "start", "test"].includes(script)) {
//   const result = spawn.sync(
//     "node",
//     nodeArgs.concat(require.resolve("../scripts/" + script)).concat(args.slice(scriptIndex + 1)),
//     { stdio: "inherit" }
//   )
// } else {
//   console.log('Unknown script "' + script + '".')
//   console.log("Perhaps you need to update femi-scripts?")
// }

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
  .command("build")
  .arguments("[env...]")
  .description("build the project")
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

program.on("command:*", function() {
  console.error(
    "Invalid command: %s\nSee --help for a list of available commands.",
    program.args.join(" ")
  )
  process.exit(1)
})

program.parse(process.argv)
