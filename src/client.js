import { GraphQLClient } from "graphql-request";
import prettyjson from "prettyjson";

/**
 * Create a Shopify Storefront GraphQL client for the provided name and token.
 */
export const createClient = ({ storeUrl, storefrontToken }) =>
  new GraphQLClient(`${storeUrl}/api/2019-10/graphql.json`, {
    headers: {
      "X-Shopify-Storefront-Access-Token": storefrontToken,
    },
  });

/**
 * Print an error from a GraphQL client
 */
export const printGraphQLError = (e) => {
  const prettyjsonOptions = { keysColor: "red", dashColor: "red" };

  if (e.response && e.response.errors) {
    console.error(prettyjson.render(e.response.errors, prettyjsonOptions));
  }

  if (e.request) console.error(prettyjson.render(e.request, prettyjsonOptions));
};

/**
 * Request a query from a client.
 */

export const queryOnce = async (
  client,
  query,
  first = 100,
  after,
  firstProduct = 100,
  afterProduct
) => client.request(query, { first, after, firstProduct, afterProduct });

/**
 * Get all paginated data from a query. Will execute multiple requests as
 * needed.
 */
export const queryAll = async (client, query, first, after, aggregatedResponse) => {
  const {
    data: { edges, pageInfo },
  } = await queryOnce(client, query, first, after);
  const lastNode = edges[edges.length - 1];

  const nodes = await getNodes(client, query, edges);

  aggregatedResponse
    ? (aggregatedResponse = aggregatedResponse.concat(nodes))
    : (aggregatedResponse = nodes);

  if (pageInfo.hasNextPage) {
    return queryAll(client, query, first, lastNode.cursor, aggregatedResponse);
  }

  return aggregatedResponse;
};

const getNodes = (client, query, edges) => {
  // Map through all Nodes
  const promises = edges.map(async (edge, index) => {
    // Check if there are more than 100 products
    if (!edge.node.products) return edge.node;
    if (!edge.node.products.pageInfo.hasNextPage) return edge.node;

    // Define First and After of collection with more than 100 products
    const first = 1;
    const after = edges[index - 1] ? edges[index - 1].cursor : undefined;

    // Query for products
    edge.node.products.edges = await queryCollectionProducts(client, query, first, after);
    return edge.node;
  });
  return Promise.all(promises);
};

export const queryCollectionProducts = async (
  client,
  query,
  first = 1,
  after,
  firstProduct = 100,
  afterProduct,
  aggregatedResponse
) => {
  const {
    data: { edges, pageInfo },
  } = await queryOnce(client, query, first, after, firstProduct, afterProduct);
  const products = edges[0].node.products;
  const lastProductNode = products.edges[products.edges.length - 1];
  const nodes = products.edges.map((edge) => edge);

  aggregatedResponse
    ? (aggregatedResponse = aggregatedResponse.concat(nodes))
    : (aggregatedResponse = nodes);

  if (products.pageInfo.hasNextPage) {
    return queryCollectionProducts(
      client,
      query,
      first,
      after,
      firstProduct,
      lastProductNode.cursor,
      aggregatedResponse
    );
  }

  return aggregatedResponse;
};
