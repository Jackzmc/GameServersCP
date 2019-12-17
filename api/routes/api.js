const router = require('express').Router();
const marked = require('marked')
const fs = require('fs').promises
const path = require('path')
const cors = require('cors')
const mcversions = require('mcversions')

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
router.get('/versions',(req,res) => {
    let latest = {}
    mcversions.getLatestReleaseVersion(function (err, version) {
        if (err) {
            res.status(500).json({
                resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
            })
            console.error('[Error]',req.path,err.message)
        }else{
            latest = version;
        }
    });
    mcversions.getAllVersions(function (err, versions) {
        if (err) {
            res.status(500).json({
                resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
            })
            console.error('[Error]',req.path,err.message)
        }else{

            res.json({
                latest,
                versions:versions.filter(v => v.type === 'release')
            })
        }
    });
})
router.get('/versions/latest',(req,res) => {
    mcversions.getLatestReleaseVersion(function (err, version) {
        if (err) {
            res.status(500).json({
                resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
            })
            console.error('[Error]',req.path,err.message)
        }
        res.json(version)
    });
})

router.get('*',(req,res) => {
    res.status(404).json({resource:req.path,reason:'EndpointNotFound'})
})