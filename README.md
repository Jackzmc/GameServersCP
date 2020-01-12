# gameservercp

**NOTE**: In development, see [trello page here](https://trello.com/b/YBirckVh/gameservercp). 
Support would be appreciated, feel free to ask what needs to be done.

A control panel to allow others to manage game servers, including Minecraft and select steam games (using steamcmd).


## Project setup
This project is split into api and ui directories. You need to build the UI part, or serve it with nginx.
You can run `npm run build` to build the UI & serve it w/ the api server, or run the UI dev server and run api server with:
`npm run dev`

If you cd into the ui folder, you can run npm script 'build'
`npm run build`

Then you need to go into the api folder, and just run index.js
`node index.js` 
it should automatically use the dist folder in the ui folder


This will automatically generate a `servers/` folder that will contain all the server setups. You can change this with an environmental variable. See all environmental variables in sample.env in the api or ui folder (most are in api, ui for just pointing to api server)

It may also create a data folder, which can possibly in the future auto manage steamcmd, and spigot installations.


### How to Contribute

1.    Clone repo and create a new branch: $ git checkout https://github.com/jackzmc/gameservercp -b name_for_new_branch.
2.    Make changes and test
3.    Submit Pull Request with comprehensive description of changes
