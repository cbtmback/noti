import InteractCreateWebhook from "App//Classes/InteractCreateWebhook";

export default class V2NotificationsController {

  public async index() {
    const interactCreateWebhook = new InteractCreateWebhook();

    const getServers = await interactCreateWebhook.getServers()
    const getSites = await interactCreateWebhook.getSites()
    const getWebhook = await interactCreateWebhook.getWebhook()
    const createWebhook = await interactCreateWebhook.createWebhook()

    // console.log(("SUCCESS" in getServers))
    // getSites.map((x) => {
    //   console.log(x)
    // })



    return {
      getServers,
      getSites,
      getWebhook,
      createWebhook
    }
  }

}
