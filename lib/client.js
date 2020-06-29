"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryAll = exports.queryOnce = exports.printGraphQLError = exports.createClient = void 0;

var _graphqlRequest = require("graphql-request");

var _prettyjson = _interopRequireDefault(require("prettyjson"));

/**
 * Create a Shopify Storefront GraphQL client for the provided name and token.
 */
const createClient = ({
  storeUrl,
  storefrontToken
}) => new _graphqlRequest.GraphQLClient(`${storeUrl}/api/2019-10/graphql.json`, {
  headers: {
    'X-Shopify-Storefront-Access-Token': storefrontToken
  }
});
/**
 * Print an error from a GraphQL client
 */


exports.createClient = createClient;

const printGraphQLError = e => {
  const prettyjsonOptions = {
    keysColor: 'red',
    dashColor: 'red'
  };

  if (e.response && e.response.errors) {
    console.error(_prettyjson.default.render(e.response.errors, prettyjsonOptions));
  }

  if (e.request) console.error(_prettyjson.default.render(e.request, prettyjsonOptions));
};
/**
 * Request a query from a client.
 */


exports.printGraphQLError = printGraphQLError;

const queryOnce = async (client, query, first = 100, after) => client.request(query, {
  first,
  after
});
/**
 * Get all paginated data from a query. Will execute multiple requests as
 * needed.
 */


exports.queryOnce = queryOnce;

const queryAll = async (client, query, first, after, aggregatedResponse) => {
  const {
    data: {
      edges,
      pageInfo
    }
  } = await queryOnce(client, query, first, after);
  const lastNode = edges[edges.length - 1];
  const nodes = edges.map(edge => edge.node);
  aggregatedResponse ? aggregatedResponse = aggregatedResponse.concat(nodes) : aggregatedResponse = nodes;

  if (pageInfo.hasNextPage) {
    return queryAll(client, query, first, lastNode.cursor, aggregatedResponse);
  }

  return aggregatedResponse;
};

exports.queryAll = queryAll;