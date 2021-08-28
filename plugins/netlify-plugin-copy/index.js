const fs = require("fs-extra")
/**
 * For netlify, we need to copy the candidates data to the functions individually.
 * This is not require for getStaticProps, since it can read from the filesystem out-of-the-box.
 */
module.exports = {
    onBuild: async () => {
      console.log("Copying assets to Netlify functions..")
      const dir = (await fs.readdir("./serverless")).filter(d => d.includes(select))
      await Promise.all(dir.map(async(d) => {
          // Copy into this directory
          console.log(`- ${d}`)
          console.log(await fs.copy(`./candidates`,`./serverless/${d}`))
          console.log(await fs.readdir(`./serverless/${d}`))
      }))
      console.log("Copied successfully.")
    },
  }