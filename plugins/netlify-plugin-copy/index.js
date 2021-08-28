const fs = require("fs-extra")
/**
 * For netlify, we need to copy the candidates data to the functions individually.
 * This is not require for getStaticProps, since it can read from the filesystem out-of-the-box.
 */
module.exports = {
    onBuild: async () => {
      console.log(await fs.readdir("./"))
      const dir = await fs.readdir("./serverless")
      console.log(dir)
      await Promise.all(dir.map(async(d) => {
        if(d.includes("select")) {
          // Copy into this directory
          console.log(d,await fs.readdir(d))
        }
      }))
    },
  }