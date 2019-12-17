const router = require('express').Router();
const marked = require('marked')
const fs = require('fs').promises
const path = require('path')
const cors = require('cors')

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
router.get('*',(req,res) => {
    res.status(404).json({resource:req.path,reason:'EndpointNotFound'})
})