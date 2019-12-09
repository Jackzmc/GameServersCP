const router = require('express').Router();
module.exports = router;

const fs = require('fs').promises
const readline = require('readline');
const fsl = require('fs')
const unzip = require('unzipper');
const zlib = require('zlib')
const propParser = require("properties-file");
const isPortReachable = require('is-port-reachable');
const path = require('path')

const {getOne,getDB} = require('../modules/util')
const {ObjectId} = require('mongodb');

// router.get('/:server/start',(req,res) => {

// })
// router.get('/:server/stop',(req,res) => {
    
// })

const DEFAULT_PORTS = {minecraft: 25565, source: 27015}

router.get('/list',async(req,res) => {
    try {
        res.json({
            servers: await getDB().collection("servers").find({}).toArray()
        })
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error]',req.path,err.message)
    }
})
router.get('/:id',async(req,res) => {
    try {
        try {
            _id = new ObjectId(req.params.id)
            const arr = await getDB().collection("servers").find(_id).toArray();
            res.json({
                server: arr.length > 0 ? arr[0] : {}
            })
        }catch(ex) {
            res.status(400).json({resource:req.path,error:"Invalid server id. Needs to be 12 string or 24 hex chars.",reason:"InvalidServerID"})
        }
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error]',req.path,err.message)
    }
})
router.get(':id/portcheck',async(req,res) => {
    try {
        try {
            _id = new ObjectId(req.params.id)
            const arr = await getDB().collection("servers").find(_id).toArray();
            try {
                if(arr.length > 0 && arr[0].ip ) {
                    const ip = arr[0].ip;
                    const port = arr[0].port||DEFAULT_PORTS[arr[0].type]
                    const status = await isPortReachable(port, {host:ip})
    
                    res.json({reachable:status})
                }else{
                    res.json({
                        reachable:'error',
                        reason:'no_ip'
                    })
                }
            } catch(err) {
                res.status(500).json({
                    resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
                })
                console.error('[Error]',req.path,err.message)
            }
        }catch(ex) {
            res.status(400).json({resource:req.path,error:"Invalid server id. Needs to be 12 string or 24 hex chars.",reason:"InvalidServerID"})
        }
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error]',req.path,err.message)
    }
})


router.get('/:id/config',async(req,res) => {
    try {
        try {
            _id = new ObjectId(req.params.id)
            const arr = await getDB().collection("servers").find(_id).toArray();
            const server = arr.length > 0 ? arr[0] : {};
            if(!server) return res.status(404).json({resource:req.path,reason:"NotFound"})
            try {
                let final_object = {}
                if(server.type == "minecraft") {
                    const server_prop = await fs.readFile(path.join(server.path,"/server.properties"),'utf-8');
                    final_object['server_properties'] = propParser.parse(server_prop)
                }
                res.json(final_object)
            }catch(exc) {
                res.status(500).json({
                    resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
                })
                console.error('[Error]',req.path,exc.message)
            }
        }catch(ex) {
            res.status(400).json({resource:req.path,error:"Invalid server id. Needs to be 12 string or 24 hex chars.",reason:"InvalidServerID"})
        }
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error]',req.path,err.message)
    }
})

router.get('/:id/backups',async(req,res) => {
    try {
        try {
            _id = new ObjectId(req.params.id)
            const arr = await getDB().collection("servers").find(_id).toArray();
            const server = arr.length > 0 ? arr[0] : {};
            if(!server) return res.status(404).json({resource:req.path,reason:"NotFound"})
            try {
                const files = await fs.readdir(path.join(server.path,"/backups"));
                const backups = [];
                for(const v in files) {
                    const info = await fs.stat(path.join(server.path,"/backups/",files[v]))
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
                res.status(500).json({
                    resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
                })
                console.error('[Error]',req.path,exc.message)
            }
        }catch(ex) {
            res.status(400).json({resource:req.path,error:"Invalid server id. Needs to be 12 string or 24 hex chars.",reason:"InvalidServerID"})
        }
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error]',req.path,err.message)
    }
})
router.get('/:id/backups/:backup',async(req,res) => {
    try {
        try {
            _id = new ObjectId(req.params.id)
            const arr = await getDB().collection("servers").find(_id).toArray();
            const server = arr.length > 0 ? arr[0] : {};
            if(!server) return res.status(404).json({resource:req.path,reason:"NotFound"})
            try {
                const rawStream = fsl.createReadStream(path.join(server.path,"/backups/",req.params.backup));
                rawStream.on('error',(err) => {
                    res.status(500).json({
                        resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
                    })
                    console.error('[Error]',req.path,err.message)
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
                console.error('[Error]',req.path,exc.message)
            }
        }catch(ex) {
            res.status(400).json({resource:req.path,error:"Invalid server id. Needs to be 12 string or 24 hex chars.",reason:"InvalidServerID"})
        }
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error]',req.path,err.message)
    }
})

router.get('/:id/logs',async(req,res) => {
    try {
        try {
            _id = new ObjectId(req.params.id)
            const arr = await getDB().collection("servers").find(_id).toArray();
            const server = arr.length > 0 ? arr[0] : {};
            if(!server) return res.status(404).json({resource:req.path,reason:"NotFound"})
            try {
                const files = await fs.readdir(path.join(server.path,"/logs"));
                const backups = [];
                for(const v in files) {
                    const info = await fs.stat(path.join(server.path,"/logs/",files[v]))
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
                res.status(500).json({
                    resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
                })
                console.error('[Error]',req.path,exc.message)
            }
        }catch(ex) {
            res.status(400).json({resource:req.path,error:"Invalid server id. Needs to be 12 string or 24 hex chars.",reason:"InvalidServerID"})
        }
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error]',req.path,err.message)
    }
})
router.get('/:id/logs/:log',async(req,res) => {
    try {
        try {
            _id = new ObjectId(req.params.id)
            const arr = await getDB().collection("servers").find(_id).toArray();
            const server = arr.length > 0 ? arr[0] : {};
            if(!server) return res.status(404).json({resource:req.path,reason:"NotFound"})
            try {
                const rawStream = fsl.createReadStream(path.join(server.path,"/logs",req.params.log));
                if(req.query.download) {
                    return rawStream.pipe(res);
                }
                const lineReader = readline.createInterface({
                    input: req.params.log.includes(".gz") ? rawStream.pipe(zlib.createGunzip()) : rawStream
                });
                const buffer = [];
                lineReader.on('line',(line) => {
                    buffer.push(line);
                })
                lineReader.on('close',() => {
                    res.json(buffer)
                })
                
            }catch(exc) {
                res.status(500).json({
                    resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
                })
                console.error('[Error]',req.path,exc.message)
            }
        }catch(ex) {
            res.status(400).json({resource:req.path,error:"Invalid server id. Needs to be 12 string or 24 hex chars.",reason:"InvalidServerID"})
        }
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error]',req.path,err.message)
    }
})