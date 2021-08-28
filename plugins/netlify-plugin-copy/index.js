const fs = require("fs")
const {promises} = fs
module.exports = {
    onPostBuild: async () => {
      console.log(await promises.readdir("./"))
      console.log(await promises.readdir("../"))
      console.log(await promises.readdir("../../"))
    },
  }