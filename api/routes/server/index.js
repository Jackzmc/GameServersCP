const router = require('express').Router();
module.exports = router;

const fs = require('fs').promises
const readline = require('readline');
const fsl = require('fs')

const zlib = require('zlib')
const propParser = require("properties-file");
const isPortReachable = require('is-port-reachable');
const path = require('path')
const { check, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4')

const {getOne,getDB,io,getDataDir,getId} = require('../../modules/util')
const {ObjectId} = require('mongodb');
const procm = require('../../modules/processManager');

procm.init(io)

// router.get('/:server/start',(req,res) => {

// })
// router.get('/:server/stop',(req,res) => {
    
// })

const SUPPORTED_TYPES = ['minecraft','sourcegame']
const DEFAULT_PORTS = {minecraft: 25565, source: 27015}
const ROOT_DIR = getDataDir();

router.use('/:id/backups',require('./backups'))


router.get('/',async(req,res) => {
    try {
        res.json({
            servers: await getDB().collection("servers").find({}).project({
                _id:1,
                name:1,
                players:1,
                players_max:1,
                type:1,
                status:1,
                started:1,
                tags:1
            }).toArray()
        })
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error]',req.path,err.message)
    }
})
router.get('/test/:type/:version',(req,res) => {
    require('../modules/fileManager').checkJar(req.params.type,req.params.version).then(() => {
        res.json({exists:true})
    }).catch(err => {
        res.json({exists:false})
    })
})
router.post('/create',[
    check('id')
        .optional().exists().custom(v => /^[A-Za-z0-9_-]+$/.test(v)).withMessage('ID must be contain alphanumeric characters'),
    check('name')
        .exists().withMessage('A name for the server is required')
        .isString().withMessage('A name for the server must be a string')
        .not().isEmpty().withMessage('A name for the server is required'),
    check('type')
        .exists().withMessage('The type of server is required')
        .isString().withMessage('Invalid server type')
        .custom((v,{req}) => SUPPORTED_TYPES.includes(v)).withMessage('Invalid server type'),
    check('appid').if((v,{req}) => req.body.type === 'sourcegame')
        .exists().withMessage('An appid is required for sourcegames')
        .isString().withMessage('The appid needs to be a string')
        .not().isEmpty().withMessage('An appid is required for sourcegames'),
    check('mc.version').if(v => v.type === 'minecraft')
        .exists().withMessage('A minecraft version is required for minecraft')
        .isString().withMessage('A minecraft version must be a string')
        .not().isEmpty().withMessage('A minecraft version is required for minecraft'),
    check('mc.jar').if(v => v.type === "minecraft")
        .exists().withMessage('A server type is required for minecraft')
        .isString().withMessage('A server type for minecraft must be a string')
        .not().isEmpty().withMessage('A server type is required for minecraft')
],async(req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }else{
        const id = req.body.id||new ObjectId();
        try {
            await getDB().collection("servers").insertOne({
                _id:id,
                name:req.body.name.trim(),
                type:req.body.type,
                appid:req.body.appid||undefined,
                mc:req.body.mc?{
                    version:req.body.mc.version,
                    jar:req.body.mc.jar,
                    memory:"512"
                }:undefined,
                tags:[],
                created:Date.now()
            })
            res.status(200).json({
                success:true,
                id
            })
        }catch(err) {
            if(err.code == 11000) { //duplicate 
                return res.status(409).json({
                    error:"Server already exists",
                    reason:"ServerAlreadyExists"
                })
            }
            res.status(500).json({
                resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
            })
            console.error('[Error]',req.path,err.message)
        }
    }
    /*
    id:this.id||UUID(),
    name:this.title,
    type:this.type,
    appid:this.appid,
    mc:{
        version:this.version,
        jar:this.jar,
        memory:'512'
    }
    */
    
})
router.get('/:id',async(req,res) => {
    const id = getId(req.params.id);
    const arr = await getDB().collection("servers").find({_id:id}).toArray();
    if(arr.length == 0) return res.status(404).json({error:"Server not found",reason:'ServerNotFound'})
    res.json(arr[0])

})
router.get('/:id/start',async(req,res) => {
    try {
        const id = getId(req.params.id);
        const arr = await getDB().collection("servers").find({_id:id}).toArray();
        const server = arr.length > 0 ? arr[0] : {};
        if(!server) return res.status(404).json({resource:req.path,reason:"NotFound"})
        procm.startServer(server).then(() => {
            res.end()
        }).catch(err => {
            res.status(500).json({error:err.message})
        })
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error]',req.path,err.message)
    }
    
})
router.patch('/:id/tags',async(req,res) => {
    if(req.body.tags && Array.isArray(req.body.tags)) {
        try {
            
            const id = getId(req.params.id)
            getDB().collection("servers").updateOne({_id:id},{$set: {tags: req.body.tags}}).then(r => {
                res.status(200).end();
            }).catch(err => {
                res.status(500).json({resource:req.path,error:"Invalid server id. Needs to be 12 string or 24 hex chars.",reason:"InvalidServerID"})
            })

            /*
            const arr = await getDB().collection("servers").find(_id).toArray();
            const server = arr.length > 0 ? arr[0] : {}
            if(server) {
                
                return res.json({exists:exists.length})
            }
            res.status(404).end();*/
        }catch(ex) {
            res.status(500).json({
                resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
            })
            console.error('[Error]',req.path,ex.message)
        }
    }else{
        return res.status(400).json({
            error:'Missing array of tags'
        })
    }

        
})
router.get('/:id/portcheck',async(req,res) => {
    try {
        const id = getId(req.params.id);
        const arr = await getDB().collection("servers").find({_id:id}).toArray();
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
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error]',req.path,err.message)
    }
})


router.get('/:id/config',async(req,res) => {
    try {
        const id = getId(req.params.id);
        const arr = await getDB().collection("servers").find({_id:id}).toArray();
            const server = arr.length > 0 ? arr[0] : {};
            if(!server) return res.status(404).json({resource:req.path,reason:"NotFound"})
            try {
                let final_object = {}
                if(server.type == "minecraft") {
                    const server_prop = await fs.readFile(path.join(ROOT_DIR,server._id.toString(),"/server.properties"),'utf-8');
                    final_object['server_properties'] = propParser.parse(server_prop)
                }
                res.json(final_object)
            }catch(exc) {
                res.status(500).json({
                    resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
                })
                console.error('[Error]',req.path,exc.message)
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
        const id = getId(req.params.id);
        const arr = await getDB().collection("servers").find({_id:id}).toArray();
            const server = arr.length > 0 ? arr[0] : {};
            if(!server) return res.status(404).json({resource:req.path,reason:"NotFound"})
            try {
                const _path = path.join(ROOT_DIR,server._id.toString(),"/logs");
                const files = await fs.readdir(_path);
                const logs = [];
                for(const v in files) {
                    const info = await fs.stat(path.join(ROOT_DIR,server._id,"/logs/",files[v]))
                    if(info.isFile()) {
                        logs.push({
                            name:files[v],
                            size:info.size,
                            created:info.birthtime
                        })
                    }
                }
                res.json(logs)
            }catch(exc) {
                if(exc.code === "ENOENT") return res.json([]);
                res.status(500).json({
                    resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
                })
                console.error('[Error]',req.path,exc.stack)
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
        const id = getId(req.params.id);
        const arr = await getDB().collection("servers").find({_id:id}).toArray();
            const server = arr.length > 0 ? arr[0] : {};
            if(!server) return res.status(404).json({resource:req.path,reason:"NotFound"})
            try {
                const rawStream = fsl.createReadStream(path.join(ROOT_DIR,server._id,"/logs",req.params.log));
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
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error]',req.path,err.message)
    }
})

router.delete('/:id/logs/:log',async(req,res) => {
    try {
        const id = getId(req.params.id);
        const arr = await getDB().collection("servers").find({_id:id}).toArray();
            const server = arr.length > 0 ? arr[0] : {};
            if(!server) return res.status(404).json({resource:req.path,reason:"NotFound"})
            try {
                await fs.unlink(path.join(ROOT_DIR,server._id,"/logs/",req.params.logs))
                res.json({success:true})
            }catch(exc) {
                res.status(500).json({
                    resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
                })
                console.error('[Error]',req.path,exc.message)
            }
    }catch(err) {
        res.status(500).json({
            resource:req.path,error:"500 Internal Server Error",reason:"InternalServerError"
        })
        console.error('[Error]',req.path,err.message)
    }
})


/*procm.startServer("test",null)

router.get('/test',(req,res) => {
    const output = procm.sendCommand('test',req.body.input)
    res.send(output)
})
router.post('/:id/command',(req,res) => {
    
})*/