# /server/:server/ endpoint
**Implemented**

`GET /server` - get list of servers

`GET /server/:server` - get server info

`GET /server/:server/start` 

`GET /server/:server/stop`

`GET /server/:server/restart`

`GET /server/:server/logs` - list server logs

`DELETE /server/:server/logs` - delete server log

`GET /server/:server/logs/:log ` - get individual log's text

`GET /server/:server/config` - list all server configs

`GET /server/:server/backups` - view all backups

`DELETE /server/:server/backups/:backup` - delete backup

`GET /server/:server/backups/:backup` - view backup metadeta. pass ?download to download


**Not Implemented Yet**

`GET /server/create`

`PUT /server/:server/config/:section` [not implemented] - modify section's values


NOTE: apis are not unified in response... yet?