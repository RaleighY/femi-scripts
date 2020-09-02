const spawn = require("cross-spawn")
const paths = require("../config/paths")

const args = process.argv.slice(2)

if (args.length) {
  var typeAndname = args[0].split(":")
  var type = typeAndname[0][0].toUpperCase() + typeAndname[0].slice(1)
  var name = typeAndname[1]
}

// docker build ./ -f ./docker/Dockerfile -t femi
const result = spawn.sync("docker", ["build", "./", "-f", paths["Dockerfile" + type], "-t", name], {
  stdio: "inherit",
})

console.log(result)
