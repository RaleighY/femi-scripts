#!/usr/bin/env node

const program = require("commander")
const packageJson = require("../package.json")
program.version(packageJson.version)

program
  .command("get <name>")
  .description("fetch something")
  .action(name => {
    if (name === "scn") {
      // styled-components nomarlize.css
      const fetchSCN = require("../lib/fetchSCN")
      fetchSCN("src/styles/NormalizeCss/")
    }
  })

program.on("command:*", function() {
  console.error(
    "Invalid command: %s\nSee --help for a list of available commands.",
    program.args.join(" ")
  )
  process.exit(1)
})

program.parse(process.argv)
