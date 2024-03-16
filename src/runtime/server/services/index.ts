import { useRuntimeConfig } from "#imports";

interface MongoResponse {
  document?: IDocument;
  documents?: Array<IDocument>;
  insertedId?: string;
  insertedIds?: Array<string>;
  message?: string;
  status?: string;
  statusCode?: number;
  modifiedCount?: number;
}

interface IFindOneAndUpdateResponse {
  found: boolean;
  updated: boolean;
  document?: IDocument;
}

interface IDocument {
  [key: string]: any;
}

interface IFindOneAndDeleteResponse {
  found: boolean;
  deleted: boolean;
  document?: IDocument;
}

interface IMongoHandler {
  findOne(query: { filter: any; sort: any }): Promise<IDocument | null>;
  findMany(query: { filter: any; sort: any }): Promise<Array<IDocument>>;
  updateOne(
    query: { filter: any; update: any },
    upsert: boolean
  ): Promise<boolean>;
  updateMany(
    query: { filter: any; update: any },
    upsert: boolean
  ): Promise<boolean>;
  findOneAndUpdate(
    query: { filter: any; update: any },
    updated: boolean,
    upsert: boolean
  ): Promise<IFindOneAndUpdateResponse>;
  findOneAndDelete(query: {
    filter: any;
    sort: any;
  }): Promise<IFindOneAndDeleteResponse>;
  findById(documentId: string): Promise<IDocument | null>;
  findByIdAndUpdate(
    documentId: string,
    update: any,
    updated: boolean,
    upsert: boolean
  ): Promise<IFindOneAndUpdateResponse>;
  findByIdAndDelete(documentId: string): Promise<IFindOneAndDeleteResponse>;
  insertOne(document: any, returned: boolean): Promise<IDocument | string>;
  insertMany(
    documents: Array<any>,
    returned: boolean
  ): Promise<Array<IDocument | string>>;
}

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

  /**
   * This TypeScript function asynchronously queries a database to find a single document based on the
   * provided filter and sort criteria.
   * @param query - The `findOne` function takes a single parameter `query`, which is an object with
   * two properties:
   * @returns The `findOne` method is returning an object or `null`. It fetches data from a specified
   * endpoint using a POST request with the provided `dbConfig` object as the body. If the fetched data
   * contains a `document` property, it extracts the document, assigns its `_id` to an `id` property,
   * and removes the `_id` property before returning the modified document. If no
   */
  public async findOne(query: { filter: any }): Promise<IDocument | null> {
    var dbConfig = {
      dataSource: this.CLUSTER_NAME,
      database: this.DATABASE_NAME,
      collection: this.COLLECTION_NAME,
      filter: query.filter ? query.filter : {},
    };

    let data: MongoResponse;

    try {
      data = await fetch(`${this.BASE_URL}/endpoint/data/v1/action/findOne`, {
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
    } catch (error) {
      throw new Error(error);
    }

    if (!data?.document) return null;

    const tempDocument = data.document;
    tempDocument.id = data.document._id;
    delete tempDocument._id;

    return tempDocument;
  }

  /**
   * This TypeScript function asynchronously fetches data from a MongoDB database based on the provided
   * query parameters and returns the results in a modified format.
   * @param query - The `findMany` function takes a `query` parameter which is an object with two
   * properties:
   * @returns An array of objects is being returned after fetching data from the specified endpoint and
   * processing it to remove the "_id" field and add an "id" field to each document.
   */
  public async findMany(query: {
    filter: any;
    sort: any;
  }): Promise<Array<object>> {
    var dbConfig = {
      dataSource: this.CLUSTER_NAME,
      database: this.DATABASE_NAME,
      collection: this.COLLECTION_NAME,
      filter: query.filter ? query.filter : {},
      sort: query.sort ? query.sort : {},
    };

    let data: MongoResponse;

    try {
      data = await fetch(`${this.BASE_URL}/endpoint/data/v1/action/find`, {
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
    } catch (error) {
      throw new Error(error);
    }

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

  /**
   * This TypeScript function asynchronously fetches data from a MongoDB database based on the provided
   * query parameters and returns the results after processing them.
   * @param query - The `findMany` function takes a `query` parameter which is an object with two
   * properties:
   * @returns An array of objects is being returned after fetching data from the specified endpoint and
   * processing it to remove the "_id" field and add an "id" field to each document.
   */
  public async updateOne(
    query: {
      filter: any;
      update: any;
    },
    upsert: boolean
  ): Promise<boolean> {
    var dbConfig = {
      dataSource: this.CLUSTER_NAME,
      database: this.DATABASE_NAME,
      collection: this.COLLECTION_NAME,
      filter: query.filter ? query.filter : {},
      update: query.update ? query.update : {},
      upsert: upsert,
    };

    let data: MongoResponse;

    try {
      data = await fetch(`${this.BASE_URL}/endpoint/data/v1/action/updateOne`, {
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
    } catch (error) {
      throw new Error(error);
    }

    if (data.modifiedCount == 0) return false;

    return true;
  }

  /**
   * This TypeScript function updates multiple documents in a MongoDB collection based on a given
   * filter and update criteria, with an option to upsert if specified.
   * @param query - The `query` parameter in the `updateMany` function is an object that contains two
   * properties:
   * @param {boolean} upsert - The `upsert` parameter in the `updateMany` function is a boolean flag
   * that determines whether a new document should be created if no documents match the filter criteria
   * during the update operation. If `upsert` is set to `true`, a new document will be created if no
   * matching documents are
   * @returns The `updateMany` method is returning a boolean value. It returns `true` if the update
   * operation was successful and at least one document was modified, otherwise it returns `false`.
   */
  public async updateMany(
    query: {
      filter: any;
      update: any;
    },
    upsert: boolean
  ): Promise<boolean> {
    var dbConfig = {
      dataSource: this.CLUSTER_NAME,
      database: this.DATABASE_NAME,
      collection: this.COLLECTION_NAME,
      filter: query.filter ? query.filter : {},
      update: query.update ? query.update : {},
      upsert: upsert,
    };

    let data: MongoResponse;

    try {
      data = await fetch(
        `${this.BASE_URL}/endpoint/data/v1/action/updateMany`,
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
    } catch (error) {
      throw new Error(error);
    }

    if (data.modifiedCount == 0) return false;

    return true;
  }

  /**
   * This TypeScript function performs a findOneAndUpdate operation with optional upsert and update
   * parameters, returning a response object with details of the operation.
   * @param query - The `query` parameter in the `findOneAndUpdate` method is an object that contains
   * two properties:
   * @param {boolean} updated - The `updated` parameter in the `findOneAndUpdate` method indicates
   * whether the document should be updated if found. If `updated` is set to `true`, the document will
   * be updated with the provided update data. If `updated` is set to `false`, the method will return
   * the found document
   * @param {boolean} upsert - The `upsert` parameter in the `findOneAndUpdate` method is a boolean
   * flag that specifies whether a new document should be created if no document matches the query
   * criteria. If `upsert` is set to `true` and no document is found that matches the query, a new
   * document will be
   * @returns The `findOneAndUpdate` method returns a `Promise` that resolves to an object of type
   * `IFindOneAndUpdateResponse`. This object contains information about whether a document was found,
   * updated.
   */
  public async findOneAndUpdate(
    query: {
      filter: any;
      update: any;
    },
    updated: boolean,
    upsert: boolean
  ): Promise<IFindOneAndUpdateResponse> {
    let response: IFindOneAndUpdateResponse = {
      found: false,
      updated: false,
    };
    const findQuery = {
      filter: query.filter,
      sort: {},
    };
    const findedDocument = await this.findOne(findQuery);

    if (!findedDocument) {
      response.found = false;
      return response;
    }

    if (findedDocument) {
      response.found = true;
    }

    const resUpdatedDocument = await this.updateOne(query, upsert);

    if (resUpdatedDocument && findedDocument) {
      response.updated = true;
    }

    const findAfterUpdate = await this.findOne(findQuery);

    if (updated) {
      response.document = findAfterUpdate;
    } else {
      response.document = findedDocument;
    }

    return response;
  }

  /**
   * This TypeScript function asynchronously finds and deletes a document based on a given query.
   * @param query - The `findOneAndDelete` method takes a query object as a parameter, which includes
   * two properties:
   * @returns The `findOneAndDelete` method returns a Promise that resolves to an object of type
   * `IFindOneAndDeleteResponse`. This object contains information about whether a document was found,
   * whether it was successfully deleted, and the document itself.
   */
  public async findOneAndDelete(query: {
    filter: any;
    sort: any;
  }): Promise<IFindOneAndDeleteResponse> {
    let response: IFindOneAndDeleteResponse = {
      found: false,
      deleted: false,
      document: null,
    };
    const findedDocument = await this.findOne(query);

    if (!findedDocument) {
      return response;
    }

    response.found = true;
    response.document = findedDocument;

    const resDelete = await this.deleteOne(query);

    if (resDelete) {
      response.deleted = true;
    }

    return response;
  }

  /**
   * This TypeScript function deletes a single document from a MongoDB collection based on the provided
   * filter.
   * @param query - The `deleteOne` function takes a query object as a parameter, which contains a
   * filter property. This filter property is used to specify the criteria for deleting a document from
   * a MongoDB collection. If the filter property is not provided, an empty object is used as the
   * default filter.
   * @returns This function is a method that deletes one document from a MongoDB collection based on
   * the provided filter. It sends a POST request to a specified endpoint with the database
   * configuration and filter criteria. If the deletion is successful (i.e., if the `modifiedCount` in
   * the response is greater than 0), it returns `true`. Otherwise, it returns `false`.
   */
  public async deleteOne(query: { filter: any }): Promise<boolean> {
    const dbConfig = {
      dataSource: this.CLUSTER_NAME,
      database: this.DATABASE_NAME,
      collection: this.COLLECTION_NAME,
      filter: query.filter ? query.filter : {},
    };

    let data: MongoResponse;

    try {
      data = await fetch(`${this.BASE_URL}/endpoint/data/v1/action/deleteOne`, {
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
    } catch (error) {
      throw new Error(error);
    }

    if (data.modifiedCount == 0) return false;

    return true;
  }

  /**
   * This TypeScript function deletes multiple documents from a MongoDB collection based on a specified
   * filter.
   * @param query - The `deleteMany` function takes a query object as a parameter, which contains a
   * `filter` property. This `filter` property is used to specify the criteria for deleting documents
   * from a collection in a MongoDB database. The function sends a request to a specified endpoint to
   * perform the deletion operation based on
   * @returns The `deleteMany` method is returning a Promise that resolves to a boolean value. If the
   * `modifiedCount` in the response data is 0, it returns `false`, indicating that no documents were
   * deleted. Otherwise, it returns `true`, indicating that documents were successfully deleted.
   */
  public async deleteMany(query: { filter: any }): Promise<boolean> {
    const dbConfig = {
      dataSource: this.CLUSTER_NAME,
      database: this.DATABASE_NAME,
      collection: this.COLLECTION_NAME,
      filter: query.filter ? query.filter : {},
    };

    let data: MongoResponse;

    try {
      data = await fetch(
        `${this.BASE_URL}/endpoint/data/v1/action/deleteMany`,
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
    } catch (error) {
      throw new Error(error);
    }

    if (data.modifiedCount == 0) return false;

    return true;
  }

  /**
   * This TypeScript function finds a document by its ID and returns it asynchronously.
   * @param {string} documentId - The `documentId` parameter is a string that represents the unique
   * identifier of a document that you want to find in a database. In this case, it is used to query a
   * document based on its `_id` field.
   * @returns The `findById` method is returning a Promise that resolves to either an `IDocument`
   * object or `null`.
   */
  public async findById(documentId: string): Promise<IDocument | null> {
    const document = await this.findOne({
      filter: {
        _id: { $oid: `${documentId}` },
      },
    });

    return document;
  }

  /**
   * This TypeScript function finds a document by ID and updates it based on the provided parameters.
   * @param {string} documentId - The `documentId` parameter is a string that represents the unique
   * identifier of the document you want to find and update in the database.
   * @param {any} update - The `update` parameter in the `findByIdAndUpdate` method is used to specify
   * the changes that need to be applied to the document identified by the `documentId`. It can contain
   * the fields and values that you want to update in the document.
   * @param {boolean} updated - The `updated` parameter in the `findByIdAndUpdate` method indicates
   * whether the document should be updated if found. If `updated` is set to `true`, the document will
   * be updated with the provided data. If `updated` is set to `false`, the document will not be
   * updated even if
   * @param {boolean} upsert - The `upsert` parameter in the `findByIdAndUpdate` method indicates
   * whether a new document should be created if no document matches the query criteria. If `upsert` is
   * set to `true`, a new document will be created if no matching document is found based on the filter
   * criteria. If `
   * @returns The `document` variable is being returned, which is the result of the `findOneAndUpdate`
   * method called with the `findQuery`, `updated`, and `upsert` parameters.
   */
  public async findByIdAndUpdate(
    documentId: string,
    update: any,
    updated: boolean,
    upsert: boolean
  ): Promise<IFindOneAndUpdateResponse> {
    const findQuery = {
      filter: {
        _id: { $oid: documentId },
      },
      update: update,
    };

    const document = await this.findOneAndUpdate(findQuery, updated, upsert);

    return document;
  }

  /**
   * The function findByIdAndDelete asynchronously finds and deletes a document by its ID.
   * @param {string} documentId - The `documentId` parameter is a string that represents the unique
   * identifier of the document you want to find and delete from the database.
   * @returns The `document` that is being deleted based on the provided `documentId` is being
   * returned.
   */
  public async findByIdAndDelete(
    documentId: string
  ): Promise<IFindOneAndDeleteResponse> {
    const query = {
      filter: {
        _id: { $oid: documentId },
      },
      sort: {},
    };

    const document = await this.findOneAndDelete(query);

    return document;
  }

  /**
   * This function asynchronously inserts a document into a MongoDB collection and optionally returns
   * the inserted document.
   * @param {any} document - The `document` parameter in the `insertOne` function represents the data
   * that you want to insert into the database. It should be an object containing the fields and values
   * that you want to store in the database. This data will be inserted into the specified collection
   * in the database.
   * @param {boolean} returned - The `returned` parameter in the `insertOne` function is a boolean flag
   * that indicates whether the newly inserted document should be returned after the insertion
   * operation is completed. If `returned` is set to `true`, the function will fetch and return the
   * newly inserted document by calling the `findById` method
   * @returns The `insertOne` method is returning either the `insertedId` of the inserted document if
   * `returned` is false, or it is returning the newly inserted document if `returned` is true.
   */
  public async insertOne(
    document: any,
    returned: boolean
  ): Promise<IDocument | string> {
    const dbConfig = {
      dataSource: this.CLUSTER_NAME,
      database: this.DATABASE_NAME,
      collection: this.COLLECTION_NAME,
      document: document,
    };

    let data: MongoResponse;

    try {
      data = await fetch(`${this.BASE_URL}/endpoint/data/v1/action/insertOne`, {
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
    } catch (error) {
      throw new Error(error);
    }

    if (!returned) return data.insertedId;

    const newDocument = await this.findById(data.insertedId);

    return newDocument!;
  }

  /**
   * The `insertMany` function asynchronously inserts multiple documents into a MongoDB collection and
   * optionally returns the inserted documents.
   * @param documents - The `documents` parameter in the `insertMany` function represents an array of
   * objects that you want to insert into a MongoDB collection. Each object in the array should contain
   * the data you want to insert into the collection.
   * @param {boolean} returned - The `returned` parameter in the `insertMany` function is a boolean
   * flag that indicates whether you want to return the newly inserted documents after performing the
   * bulk insert operation. If `returned` is set to `true`, the function will fetch and return the
   * newly inserted documents by their IDs. If `
   * @returns The `insertMany` method returns an array of `IDocument` objects or strings based on the
   * `returned` parameter. If `returned` is `false`, it returns the `insertedIds` from the data
   * response. If `returned` is `true`, it fetches and returns the newly inserted documents by their
   * IDs.
   */
  public async insertMany(
    documents: Array<any>,
    returned: boolean
  ): Promise<Array<IDocument | string>> {
    const dbConfig = {
      dataSource: this.CLUSTER_NAME,
      database: this.DATABASE_NAME,
      collection: this.COLLECTION_NAME,
      documents: documents,
    };

    let data: MongoResponse;

    try {
      data = await fetch(
        `${this.BASE_URL}/endpoint/data/v1/action/insertMany`,
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
    } catch (error) {
      throw new Error(error);
    }

    if (!returned) return data.insertedIds;

    const newDocuments: Array<IDocument> = [];

    for (const id of data.insertedIds) {
      const newDocument = await this.findById(id);
      newDocuments.push(newDocument);
    }

    return newDocuments;
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
