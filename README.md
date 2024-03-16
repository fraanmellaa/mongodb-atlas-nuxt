# NUXT MODULE TO USE MONGODB ATLAS API WITH CLOUDFLARE

This module allows you to make requests to MongoDB Atlas from a handler with functions such as insertMany, findOne, etc...

The functions provide information about the parameters that need to be passed to them.

To use it is as easy as:

1 - Import { mongoHandler } from "#mongodb-atlas-nuxt";

2 - const mongo = await mongoHandler(DATABASE_NAME, COLLECTION_NAME)

\*\* The database name is not the same as the Cluster.

3 - const query = { filter: { \_id: { $oid: "EXAMPLE_ID"} } }

4 - const res = await mongo.findOne(query)

For example this method, receives a query object with filter param and within the same query as if you were sending it directly to the API.
You receive the document if is found or null if not.

Each method has the params you need to pass to it and what it will returns to you.
