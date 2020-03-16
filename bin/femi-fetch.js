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

program.parse(process.argv)
