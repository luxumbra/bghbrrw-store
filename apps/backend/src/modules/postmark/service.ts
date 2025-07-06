import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils";
import { Logger } from "@medusajs/framework/types";

type InjectedDependencies = {
  logger: Logger;
};

type Options = {
  apiKey: string;
};

class MyNotificationProviderService extends AbstractNotificationProviderService {
  protected logger_: Logger;

  protected options_: Options;
  static identifier = "my-notification";

  static validateOptions(options: Record<any, any>) {
    if (!options.apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,

        "API key is required in the provider's options."
      );
    }
  }

  // assuming you're initializing a client

  protected client;

  constructor(
    { logger }: InjectedDependencies,

    options: Options
  ) {
    super();

    this.logger_ = logger;

    this.options_ = options;

    // assuming you're initializing a client

    this.client = new Client(options);
  }
}

export default MyNotificationProviderService;
