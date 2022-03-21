import {BaseCommand} from '@adonisjs/core/build/standalone'

// import InteractCreateWebhook from "App/Classes/interactCreateWebhook";

export default class CreateWebhook extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'create:webhook'
  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Register Webhook with Laravel Forge'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    const {default: InteractCreateWebhook} = await import('App//Classes/InteractCreateWebhook')
    const interactCreateWebhook = new InteractCreateWebhook();

    // ...START GET SERVERS...
    let getServerStr = `[ ${this.colors.cyan('Wait')} ] Get Servers .`
    this.logger.logUpdate(getServerStr)
    // Run function get servers
    const getServers = await interactCreateWebhook.getServers()
    for (let i = 0; i <= 3; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      getServerStr += "."
      this.logger.logUpdate(getServerStr)
    }
    if (("SUCCESS" in getServers)) {
      getServerStr = `[ ${this.colors.green('Success')} ] ${getServers.SUCCESS}`
      this.logger.logUpdate(getServerStr)
    } else {
      getServerStr = `[ ${this.colors.red('Error')} ] ${getServers.ERROR.title} ${getServers.ERROR.status} ${getServers.ERROR.message}`
      this.logger.logUpdate(getServerStr)
    }
    this.logger.logUpdatePersist()
    // ...END GET SERVER...

    // ...START GET SITES...
    let getSiteStr = `[ ${this.colors.cyan('Wait')} ] Get Sites .`
    this.logger.logUpdate(getSiteStr)
    const getSites = await interactCreateWebhook.getSites()

    for (let i = 0; i <= 3; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      getSiteStr += '.'
      this.logger.logUpdate(getSiteStr)
    }
    getSites.forEach((element) => {
      if (("SUCCESS" in element)) {
        getSiteStr = `[ ${this.colors.green('Success')} ] ${element.SUCCESS}`
        this.logger.logUpdate(getSiteStr)
        this.logger.logUpdatePersist()
      } else {
        getSiteStr = `[ ${this.colors.red('Error')} ] ${element.ERROR.title} ${element.ERROR.status} ${element.ERROR.message}`
        this.logger.logUpdate(getSiteStr)
        this.logger.logUpdatePersist()
      }
    })
    // ...END GET SITES...


    // ...START GET WEBHOOK...
    let getWebhookStr = `[ ${this.colors.cyan('Wait')} ] Get Webhook .`
    this.logger.logUpdate(getWebhookStr)
    const getWebhook = await interactCreateWebhook.getWebhook()
    for (let i = 0; i <= 3; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      getWebhookStr += '.'
      this.logger.logUpdate(getWebhookStr)
    }
    getWebhook.forEach((element) => {
      if (("SUCCESS" in element)) {
        getSiteStr = `[ ${this.colors.green('Success')} ] ${element.SUCCESS}`
        this.logger.logUpdate(getSiteStr)
        this.logger.logUpdatePersist()
      } else {
        getSiteStr = `[ ${this.colors.red('Error')} ] ${element.ERROR.title} ${element.ERROR.status} ${element.ERROR.message}`
        this.logger.logUpdate(getSiteStr)
        this.logger.logUpdatePersist()
      }
    })
    // ...END GET WEBHOOK...


    // ...START CREATE WEBHOOK...
    let createWebhookStr = `[ ${this.colors.cyan('Wait')} ] Create Webhook .`
    this.logger.logUpdate(createWebhookStr)
    const createWebhook = await interactCreateWebhook.createWebhook()
    for (let i = 0; i <= 3; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      createWebhookStr += '.'
      this.logger.logUpdate(createWebhookStr)
    }

    if (("SUCCESS" in createWebhook)) {
      createWebhookStr = `[ ${this.colors.green('Success')} ] ${createWebhook.SUCCESS}`
      this.logger.logUpdate(createWebhookStr)
      this.logger.logUpdatePersist()
    } else {
      createWebhook.forEach((element) => {
        if (("SUCCESS" in element)) {
          createWebhookStr = `[ ${this.colors.green('Success')} ] ${element.SUCCESS}`
          this.logger.logUpdate(createWebhookStr)
          this.logger.logUpdatePersist()
        } else {
          createWebhookStr = `[ ${this.colors.red('Error')} ] ${element.ERROR.title} ${element.ERROR.status} ${element.ERROR.message}`
          this.logger.logUpdate(createWebhookStr)
          this.logger.logUpdatePersist()
        }
      })
    }
    // ...END CREATE WEBHOOK...
  }
}
