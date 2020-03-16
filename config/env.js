// Make sure that including paths.js after env.js will read .env variables.
// delete require.cache[require.resolve("./paths")]

function envFactory() {
  const env = Object.keys(process.env).reduce((value, key) => {
    value[key] = process.env[key]
    return value
  }, {})

  env.isEnvDevelopment = env.NODE_ENV === "development"
  env.isEnvProduction = env.NODE_ENV === "production"

  const envStringified = {
    "process.env": Object.keys(env).reduce((v, key) => {
      v[key] = JSON.stringify(env[key])
      return v
    }, {}),
  }

  env.stringify = envStringified

  return env
}

module.exports = envFactory()
