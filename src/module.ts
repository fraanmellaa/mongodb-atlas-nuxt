import {
  defineNuxtModule,
  logger,
  createResolver,
  addTemplate,
  addImports,
  addServerPlugin,
} from "@nuxt/kit";

// Module options TypeScript interface definition
export interface ModuleOptions {
  apiKey: string | undefined;
  apiBaseUrl: string | undefined;
  clusterName: string | undefined;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-mongodb-atlas",
    configKey: "mongoDBAtlas",
  },
  defaults: {
    apiKey: process.env.MONGODB_DATA_API_BASE_URL as string,
    apiBaseUrl: process.env.MONGODB_DATA_API_KEY as string,
    clusterName: process.env.MONGODB_CLUSTER_NAME as string,
  },
  async setup(_options, _nuxt) {
    if (!_options.apiBaseUrl) {
      logger.warn(
        "Missing MongoDB Atlas Data API Base URL. Please provide it in the nuxt.config.js file."
      );
    }

    if (!_options.apiKey) {
      logger.warn(
        "Missing MongoDB Atlas Data API Key. Please provide it in the nuxt.config.js file."
      );
    }

    const { resolve } = createResolver(import.meta.url);
    const config = _nuxt.options.runtimeConfig as any;

    config.mongoDBAtlas = config.mongoDBAtlas || {
      apiKey: _options.apiKey,
      apiBaseUrl: _options.apiBaseUrl,
      clusterName: _options.clusterName,
    };

    _nuxt.hook("nitro:config", (_config) => {
      _config.alias = _config.alias || {};

      _config.externals =
        typeof _config.externals === "object"
          ? _config.externals
          : {
              inline: [resolve("./runtime")],
            };
      _config.alias["#mongodb-atlas-nuxt"] = resolve(
        "./runtime/server/services"
      );
    });
  },
});
