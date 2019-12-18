const router = require('express').Router();
const marked = require('marked')
const fs = require('fs').promises
const path = require('path')
const cors = require('cors')
const got = require('got')

module.exports = router;
router.use(cors())

router.use('/server',require('./api-server'))


router.get('/docs',(req,res) => {
    fs.readFile(path.join(__dirname,'/../API_DOCS.md'), 'utf8').then(data => {
        res.send(marked(data.toString()));
    }).catch(err => {
        console.log(err);
        res.status(500).json({resource:req.path,error:'Could not parse markdown',reason:'InternalServerError'})
    })
})
router.get('/versions',async(req,res) => {
    try {
        const response = await got('https://launchermeta.mojang.com/mc/game/version_manifest.json',{responseType: 'json'})
        res.json(response.body)
    }catch(err) {
        console.error('[Error]',req.path,err.message)
        res.status(500).json({resource:req.path,reason:'InternalServerError'})
    }
})

router.get('*',(req,res) => {
    res.status(404).json({resource:req.path,reason:'EndpointNotFound'})
})