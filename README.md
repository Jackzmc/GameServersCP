# gameservercp

**NOTE**: In development

A control panel to allow others to manage gameservers, including minecraft and any source games. 
Currently features:
n/a

## Project setup
This project is split into api and ui directories. You need to build the UI part, or serve it with nginx.
If you cd into the ui folder, you can run npm script 'build'
`npm run build`

Then you need to go into the api folder, and just run index.js
`node index.js` 
it should automatically use the dist folder in the ui folder
