const spawn = require("cross-spawn")
const paths = require("../config/paths")

module.exports = function(obj) {
  const { imageType, imageName } = obj
  const realImageType = imageType[0].toUpperCase() + imageType.toLowerCase().slice(1)

  // docker build ./ -f ./docker/Dockerfile -t femi
  const result = spawn.sync(
    "docker",
    ["build", "./", "-f", paths["dockerfile" + realImageType], "-t", imageName],
    {
      stdio: "inherit",
    }
  )

  console.log(result)
}
