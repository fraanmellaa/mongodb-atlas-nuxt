import { useRuntimeConfig } from "#imports";

interface MongoResponse {
  document?: {
    [key: string]: any;
  };
  documents?: Array<{
    [key: string]: any;
  }>;
  message: string;
  status: string;
  statusCode: number;
}

interface IMongoHandler {
  findOne(filter: any, sort: any): Promise<object | null>;
  findMany(filter: any, sort: any): Promise<Array<object>>;
  updateOne(
    query: { filter: any; update: any },
    upsert: boolean
  ): Promise<Array<object>>;
}

// TODO: Export MongoQuery class to type params of functions
/**
 ** Create functions
 ** - updateOne
 ** - updateMany
 ** - deleteOne
 ** - deleteMany
 ** - insertOne
 ** - insertMany
 */

/**
 ** MongoHandler class to handle all the mongoDB operations
 ** @author Fran Mella
 */

const config = useRuntimeConfig().mongoDBAtlas;

export class MongoHandler implements IMongoHandler {
  private BASE_URL = config.apiBaseUrl;
  private API_KEY = config.apiKey;
  private CLUSTER_NAME = config.clusterName;

  private DATABASE_NAME: string;
  private COLLECTION_NAME: string;

  constructor(database_name: string, collection_name: string) {
    this.DATABASE_NAME = database_name;
    this.COLLECTION_NAME = collection_name;
  }

  public async findOne(filter: any, sort: any): Promise<object | null> {
    var dbConfig = {
      dataSource: this.CLUSTER_NAME,
      database: this.DATABASE_NAME,
      collection: this.COLLECTION_NAME,
      filter: filter ? filter : {},
    };

    const data = await fetch(
      `${this.BASE_URL}/endpoint/data/v1/action/findOne`,
      {
        method: "POST",
        body: JSON.stringify(dbConfig),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Request-Headers": "*",
          "api-key": this.API_KEY,
        },
      }
    ).then((res) => {
      return res.json() as Promise<MongoResponse>;
    });

    if (!data?.document) return null;

    const tempDocument = data.document;
    tempDocument.id = data.document._id;
    delete tempDocument._id;

    return tempDocument;
  }

  public async findMany(filter: any, sort: any): Promise<Array<object>> {
    var dbConfig = {
      dataSource: this.CLUSTER_NAME,
      database: this.DATABASE_NAME,
      collection: this.COLLECTION_NAME,
      filter: filter ? filter : {},
      sort: sort ? sort : {},
    };

    const data = await fetch(`${this.BASE_URL}/endpoint/data/v1/action/find`, {
      method: "POST",
      body: JSON.stringify(dbConfig),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Headers": "*",
        "api-key": this.API_KEY,
      },
    }).then((res) => {
      return res.json() as Promise<MongoResponse>;
    });

    if (!data?.documents && data?.documents?.length == 0) return [];

    const finalDocuments: Array<any> = [];

    for (const document of data.documents!) {
      const tempDocument = document;
      tempDocument.id = document._id;
      delete tempDocument._id;
      finalDocuments.push(tempDocument);
    }

    return finalDocuments;
  }

  public async updateOne(
    query: {
      filter: any;
      update: any;
    },
    upsert: boolean
  ): Promise<Array<object>> {
    var dbConfig = {
      dataSource: this.CLUSTER_NAME,
      database: this.DATABASE_NAME,
      collection: this.COLLECTION_NAME,
      filter: query.filter ? query.filter : {},
      update: query.update ? query.update : {},
      upsert: upsert,
    };

    const data = await fetch(
      `${this.BASE_URL}/endpoint/data/v1/action/updateOne`,
      {
        method: "POST",
        body: JSON.stringify(dbConfig),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Request-Headers": "*",
          "api-key": this.API_KEY,
        },
      }
    ).then((res) => {
      return res.json() as Promise<MongoResponse>;
    });

    if (!data?.documents && data?.documents?.length == 0) return [];

    const finalDocuments: Array<any> = [];

    for (const document of data.documents!) {
      const tempDocument = document;
      tempDocument.id = document._id;
      delete tempDocument._id;
      finalDocuments.push(tempDocument);
    }

    return finalDocuments;
  }

  private _checkQuery(query: { [key: string]: any }, toCheck: Array<string>) {
    // TODO: Implement this function
  }
}

export async function mongoHandler(
  database_name: string,
  collection_name: string
): Promise<MongoHandler> {
  const mongo = new MongoHandler(database_name, collection_name);

  return mongo;
}

export default {
  mongoHandler,
};
