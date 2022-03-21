import axios, {AxiosInstance} from "axios";
import Env from '@ioc:Adonis/Core/Env'

type OptionsError = {
  ERROR: {
    title: string,
    status: string,
    message: string
  }
}

type OptionsSuccess = {
  SUCCESS: string
}

class InteractCreateWebhook {
  private $axios: AxiosInstance;
  public serverLists: Array<any>
  public sitesLists: Array<any>
  public webhooksLists: Array<any>
  public urlServiceWebhook: String;

  constructor() {
    const token = Env.get("LARAVEL_FORGE_TOKEN");
    const baseURL = Env.get("LARAVEL_FORGE_URL");
    this.urlServiceWebhook = `${Env.get('APP_URL')}/notification`
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
    this.serverLists = []
    this.sitesLists = []
    this.webhooksLists = []
    this.$axios = axios.create({
      baseURL,
      headers,
    })
  }

  async getServers() {
    return await this.$axios.get('/servers')
      .then((result) => {
        this.serverLists = result.data.servers.map((element) => element.id)
        return this.createObjectSuccess("GET SERVERS SUCCESS")
      })
      .catch((error) => {
        const title = "LARAVEL FORGE GET SERVER :"
        return this.createObjectError(title, error)
      })
  }

  async getSites() {
    this.sitesLists = []
    return await Promise.all(this.serverLists.map((serverId) => {
        return this.$axios.get(`/servers/${serverId}/sites/`)
          .then((result) => {
            result.data.sites.map((x) => {
              let obj = {
                name: x.name,
                server_id: x.server_id,
                site_id: x.id
              }
              this.sitesLists.push(obj)
            })
            return this.createObjectSuccess(`GET SITES SUCCESS FORM SERVER ${serverId} : `)
          })
          .catch((error) => {
            const title = `ERROR LARAVEL FORGE GET SITES FORM SERVER ${serverId} : `
            return this.createObjectError(title, error)
          })
      }
    ))
  }

  async getWebhook() {
    return await Promise.all(this.sitesLists.map((element) => {
      return this.$axios.get(`/servers/${element.server_id}/sites/${element.site_id}/webhooks`)
        .then((response) => {
          let obj = {
            name: element.name,
            server_id: element.server_id,
            site_id: element.site_id,
            webhooks: response.data.webhooks
          }
          this.webhooksLists.push(obj)
          return this.createObjectSuccess(`GET WEBHOOK SUCCESS FORM ${element.name} : `)
        })
        .catch((error) => {
          const title = `ERROR LARAVEL FORGE GET WEBHOOKS FORM SITES ${element.server_id} : `
          return this.createObjectError(title, error)
        })
    }));
  }

  async createWebhook () {
    const sitesNeedWebhook = this.webhooksLists.filter((result) => result.webhooks.length === 0)
    if(sitesNeedWebhook.length > 0){
      return await Promise.all(sitesNeedWebhook.map((element) => {
        return this.$axios.post(`/servers/${element.server_id}/sites/${element.site_id}/webhooks`,{
          "url": this.urlServiceWebhook
        }).then(() => {
          return this.createObjectSuccess(`CREATE WEBHOOK SUCCESS : `)
        }).catch((error) => {
          const title = `ERROR LARAVEL FORGE CREATE WEBHOOKS FORM ${element.name} : `
          return this.createObjectError(title, error)
        })
      }))
    }else{
      return this.createObjectSuccess(`NO SITE TO NEED WEBHOOK : `)
    }

  }

  createObjectError(title, error): OptionsError {
    return {
      ERROR: {
        title: title,
        status: error.response.status,
        message: error.response.statusText,
      }
    };
  }

  createObjectSuccess(message): OptionsSuccess {
    return {
      SUCCESS: message
    };
  }
}

export default InteractCreateWebhook
