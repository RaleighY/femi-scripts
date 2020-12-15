// Make sure that including paths.js after env.js will read .env variables.
// delete require.cache[require.resolve("./paths")]

function envFactory(obj) {
  const env = Object.keys(process.env).reduce((value, key) => {
    value[key] = process.env[key]
    return value
  }, {})

  const keyArr = ["appName", "isSystem"]

  env.isEnvDevelopment = env.NODE_ENV === "development"
  env.isEnvProduction = env.NODE_ENV === "production"

  if (obj) {
    keyArr.forEach(key => {
      if (obj[key]) {
        env[key] = obj[key]
      }
    })
  }

  const envStringified = {
    "process.env": Object.keys(env).reduce((v, key) => {
      v[key] = JSON.stringify(env[key])
      return v
    }, {}),
  }

  env.stringify = envStringified

  return env
}

module.exports = envFactory
