export default class ENV {
  /*
   * @ Portal Environment Variables
   * @ Description: This class contains all the environment variables required for the portal
   * It can have framework specific environment variables such as api, database, etc.
   */

  public static APP_VERSION = process.env.APP_VERSION!;

  // API environment variables
  public static API_BASE_URL = process.env.API_BASE_URL!;
  public static TOKEN_USERNAME = process.env.TOKEN_USERNAME!;
  public static TOKEN_PASSWORD = process.env.TOKEN_PASSWORD!;

}
