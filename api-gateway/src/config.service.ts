export class ConfigService {
    private readonly envConfig: { [key: string]: any } = null;
  
    constructor() {
      this.envConfig = {
        port: process.env.API_GATEWAY_PORT,
      };
    }
  
    get(key: string): any {
      return this.envConfig[key];
    }
  }
  