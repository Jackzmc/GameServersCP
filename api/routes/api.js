const router = require('express').Router();
const marked = require('marked')
const fs = require('fs').promises
const path = require('path')
const cors = require('cors')
const got = require('got')

module.exports = router;
router.use(cors())

router.use('/server',require('./server'))


router.get('/docs',(req,res) => {
    fs.readFile(path.join(__dirname,'/../API_DOCS.md'), 'utf8').then(data => {
        res.send(marked(data.toString()));
    }).catch(err => {
        console.log(err);
        res.status(500).json({resource:req.path,error:'Could not parse markdown',reason:'InternalServerError'})
    })
})
router.get('/appids',async(req,res) => {
     fs.readFile(path.join(__dirname,'../modules/appids.json'), 'utf8').then(data => {
        const json = JSON.parse(data)
        if(req.query.show_all != null) return res.json(json)
        if(process.platform === "win32") {
            res.json(json.filter(v => v.windows === true))
        }else{
            res.json(json.filter(v => v.linux))
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({resource:req.path,error:'Could not parse appids.json',reason:'InternalServerError'})
    })
})
router.get('/versions',async(req,res) => {
    try {
        //
        const vanilla = await got('https://launchermeta.mojang.com/mc/game/version_manifest.json',{responseType: 'json'})
        const paper = await got('https://papermc.io/api/v1/paper/',{responseType: 'json'})
        
        res.json({
            latest:vanilla.body.latest,
            vanilla:vanilla.body.versions.filter(v => v.type === 'release').map(v => {
                return {
                    id:v.id,
                    url:v.url
                } 
            }),
            paper:paper.body.versions.map(v => { 
                return {
                    id:v,
                    url:`https://papermc.io/api/v1/paper/${v}/latest/download`
                }
            })
        })
    }catch(err) {
        console.error('[Error]',req.path,err.message)
        res.status(500).json({resource:req.path,reason:'InternalServerError'})
    }
})

router.get('*',(req,res) => {
    res.status(404).json({resource:req.path,reason:'EndpointNotFound'})
})