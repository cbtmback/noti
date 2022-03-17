
// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

type OptionsError = {
    title: string,
    status: number,
    message: string
    error?: string,
}

type ObjectWebHook = {
    site_id: string,
    server_id: string,
    name: string,
    webhooks?: Array<any>
}


const token = Env.get("LARAVEL_FORGE_TOKEN");
const url = Env.get("LARAVEL_FORGE_URL");

const $axios = require('axios')
const axiosOption = {
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    }
};

let laravelForgeUrl = {
    servers: `${url}/servers`,
    sites: (serverId: string) => `${url}/servers/${serverId}/sites`,
    getWebhook: (serverId: string, stieId: string) => `${url}/servers/${serverId}/sites/${stieId}/webhooks`
}

let sitesArray: Array<any> = []
let serversArray: Array<any> = []
let webhookArray: Array<any> = []
let NewWebhookArray: Array<any> = []


async function getServers() {
    const resultPromise = await new Promise((resolve, reject) => {
        $axios.get(
            laravelForgeUrl.servers,
            axiosOption,
        ).then((response) => {
            let arrayResult: Array<any> = response.data.servers;
            serversArray = [];
            serversArray = arrayResult.map((x) => x.id)
            resolve(arrayResult)
        }).catch((error) => {
            let rejectError: OptionsError = {
                title: "LARAVEL FROGE GET SERVER : ",
                status: error.response.status,
                message: error.response.statusText
            };
            reject(rejectError)
        })
    })
    return resultPromise
}

async function getSites() {
    const resultPromise = await new Promise((resolve, reject) => {
        serversArray.forEach((x) => {
            $axios.get(
                laravelForgeUrl.sites(x),
                axiosOption,
            ).then((response) => {
                let arrayResult: Array<any> = response.data.sites;
                sitesArray = [];
                arrayResult.map((obj) => {
                    let createObjectSite: ObjectWebHook = {
                        name: obj.name,
                        server_id: obj.server_id,
                        site_id: obj.id
                    }
                    sitesArray.push(createObjectSite)
                })
                resolve(arrayResult)
            }).catch((error) => {

                let rejectError: OptionsError = {
                    title: "LARAVEL FROGE GET Sites : ",
                    status: error.response.status,
                    message: error.response.statusText
                };
                reject(rejectError)
            })
        })

    })
    return resultPromise
}

async function createObjectWebHooks(element) {
    const resultPromise = await new Promise(async (resolve, reject) => {
        await $axios.get(
            laravelForgeUrl.getWebhook(element.server_id, element.site_id),
            axiosOption,
        ).then(async (response) => {
            let webHookResult: Array<any> = response.data.webhooks;
            let createObjectWebHooks = {
                name: element.name,
                server_id: element.server_id,
                site_id: element.site_id,
                webhooks: webHookResult
            }
            resolve(createObjectWebHooks)
        }).catch((error) => {
            let rejectError: OptionsError = {
                title: "LARAVEL FROGE GET WEBHOOK : ",
                status: error.response.status,
                message: error.response.statusText
            };
            reject(rejectError)
        })
    })
    return resultPromise
}

async function getWebHook() {
    const resultPromise = await new Promise(async (resolve, reject) => {
        try {
            await Promise.all(sitesArray.map(async (e) => {
                webhookArray = []
                await createObjectWebHooks(e).then((res) => {
                    webhookArray.push(res)
                }).catch((error) => {
                    reject(error)
                });
            }))
            resolve(webhookArray)
        } catch (error) {
            let rejectError: OptionsError = {
                title: "LARAVEL FROGE GET WEBHOOK : ",
                status: error.response.status,
                message: error.response.statusText
            };
            reject(rejectError)
        }

    })
    return resultPromise
}

async function sendUrlToForge(url: String, obj: any) {
    const resultPromise = await new Promise(async (resolve, reject) => {
        await $axios.post(
            laravelForgeUrl.getWebhook(obj.server_id, obj.site_id),
            { "url": url },
            axiosOption,
        ).then(async (response) => {
            let newWebhook = {
                server_id: obj.server_id,
                site_id: obj.site_id,
                name: obj.name,
                webhook: response.data.webhook
            }
            NewWebhookArray = []
            NewWebhookArray.push(newWebhook)
            resolve(NewWebhookArray)
        }).catch((error) => {
            let rejectError: OptionsError = {
                title: "LARAVEL FROGE CREATE WEBHOOK : ",
                status: error.response.status,
                message: error.response.statusText
            };
            console.log(rejectError)
            reject(rejectError)
        })
    })
    return resultPromise
}

async function createWebHook(urlServiceWebhook: String, sitesNeedWebHook: Array<any>) {

    const resultPromise = await new Promise(async (resolve, reject) => {
        try {
            // LOOP SEND CREATE WEBHOOKS
            await Promise.all(sitesNeedWebHook.map(async (e) => {
                return sendUrlToForge(urlServiceWebhook, e).then().catch((error) => {
                    return error
                })
            }))
            resolve("success")
        } catch (error) {
            let rejectError: OptionsError = {
                title: "LARAVEL FROGE CREATE WEBHOOK : ",
                status: error.status,
                message: error.statusText
            };

            reject(rejectError)
        }
    })
    return resultPromise
}


export default class NotificationsController {

    
// REGISTER URL WEBHOOK TO LARAVEL FORGE ROUTE --- GET: /createWebhook
    public async index({ response }) {
        try {
            await getServers().then(() => {
                console.log("GET SERVER SUCEESS")
            }).catch((error) => {
                return response.status(error.status).send(error.title + error.message)
            })

            await getSites().then(() => {
                console.log("GET SITES SUCEESS")
            }).catch((error) => {
                return response.status(error.status).send(error.title + error.message)
            })

            await getWebHook().then(() => {
                console.log("GET WEBHOOK SUCEESS")
            }).catch((error) => {
                return response.status(error.status).send(error.title + error.message)
            })
            // FILTER SITE NO URL WEBHOOKS
            let sitesNeedWebHook = webhookArray.filter((x) => x.webhooks.length === 0)
            if (sitesNeedWebHook.length > 0) {
                const urlServiceWebhook = `${Env.get('APP_URL')}/notification`
                await createWebHook(urlServiceWebhook, sitesNeedWebHook).then(() => {
                    console.log("CREATE WEBHOOK SUCEESS")
                }).catch((error) => {
                    return response.status(error.status).send(error.title + error.message)
                })

                return NewWebhookArray
            } else {
                return "NO SITE NEED WEBHOOK"
            }

        } catch (ex) {
            return response.status(500).send(ex.message)
        }
    }
    

    /// SEND LINE NOTIFICATION ROUTE --- POST: /notification  
    public async sendNotification({ request }) {
        const lineToken = Env.get('LINE_NOTIFY_TOKEN');
        const notifySDK = require('line-notify-sdk')
        const notify = new notifySDK()

        const data = request.body()
        const status = data.status
        const serverName = data.server.name
        const siteName = data.site.name

        if (!status && !serverName && !siteName) {
            return "Empty"
        } else {
            try {
                const info = await notify.getStatus(lineToken)
                if (info.status === 200) {

                    let message = "";
                    if (status) message += `\n${status}`
                    if (serverName) message += `\n${serverName}`
                    if (siteName) message += `\n${siteName}`

                    notify.notify(lineToken, message.trim()).then((body) => {
                        console.log(body)
                    }).catch((e) => console.log(e))
                }
            } catch (error) {
                console.log(error)
            }
        }

        return {
            status,
            serverName,
            siteName
        }
    }
}


