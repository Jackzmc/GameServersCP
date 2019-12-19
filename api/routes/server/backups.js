const router = require('express').Router({mergeParams: true});
const fs = require('fs').promises
const path = require('path')
const fsl = require('fs')
const unzip = require('unzipper');
module.exports = router;

const {getOne,getDB,getDataDir,getId} = require('../../modules/util')
const {ObjectId} = require('mongodb');

const ROOT_DIR = getDataDir();


router.get('/',async(req,res) => {
    try {
        const id = getId(req.params.id);
        const arr = await getDB().collection("servers").find({_id:id}).toArray();
            const server = arr.length > 0 ? arr[0] : {};
            if(!server) return res.status(404).json({resource:req.path,reason:"NotFound"})
            try {
                const _path = path.join(ROOT_DIR,server._id.toString(),"/backups");
                const files = await fs.readdir(_path);
                const backups = [];
                for(const v in files) {
                    const info = await fs.stat(path.join(_path,files[v]))
                    if(info.isFile()) {
                        backups.push({
                            name:files[v],
                            size:info.size,
                            created:info.birthtime
                        })
                    }
                }

                res.json(backups)
            }catch(exc) {

                if(exc.code === "ENOENT") return res.json([]);
                res.status(500).json({
                    resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
                })
                console.error('[Error:Backups]',req.path,exc.message)
            }
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error:Backups]',req.path,err.message)
    }
})
router.get('/start',(req,res) => {
    res.status(501).json({resource:req.path,reason:'NotImplemented'})
})
router.get('/:backup',async(req,res) => {
    try {
        const id = getId(req.params.id);
        const arr = await getDB().collection("servers").find({_id:id}).toArray();
            const server = arr.length > 0 ? arr[0] : {};
            if(!server) return res.status(404).json({resource:req.path,reason:"NotFound"})
            try {
                const rawStream = fsl.createReadStream(path.join(ROOT_DIR,server._id,"/backups/",req.params.backup));
                rawStream.on('error',(err) => {
                    res.status(500).json({
                        resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
                    })
                    console.error('[Error:Backups]',req.path,err.message)
                })
                if(req.query.download) {
                    return rawStream.pipe(res);
                }else{
                    const contents = [];
                    rawStream.pipe(unzip.Parse())
                    .on('entry',(entry) => {
                        contents.push({
                            name:entry.path,
                            type:entry.type,
                            size:entry.vars.uncompressedSize
                        })
                        entry.autodrain();
                    }).on('close',() => {
                        res.json(contents)
                    })
                }
            }catch(exc) {
                res.status(500).json({
                    resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
                })
                console.error('[Error:Backups]',req.path,exc.message)
            }
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error:Backups]',req.path,err.message)
    }
})

router.delete('/:backup',async(req,res) => {
    try {
        const id = getId(req.params.id);
        const arr = await getDB().collection("servers").find({_id:id}).toArray();
            const server = arr.length > 0 ? arr[0] : {};
            if(!server) return res.status(404).json({resource:req.path,reason:"NotFound"})
            try {
                await fs.unlink(path.join(ROOT_DIR,server._id,"/backups/",req.params.backup))
                res.json({success:true})
            }catch(exc) {
                res.status(500).json({
                    resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
                })
                console.error('[Error:Backups]',req.path,exc.message)
            }
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error:backups]',req.path,err.message)
    }
})
