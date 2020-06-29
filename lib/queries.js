"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PAGES_QUERY = exports.PRODUCT_TYPES_QUERY = exports.SHOP_POLICIES_QUERY = exports.PRODUCTS_QUERY = exports.COLLECTIONS_QUERY = exports.BLOGS_QUERY = exports.ARTICLES_QUERY = void 0;
const ARTICLES_QUERY = `
  query GetArticles($first: Int!, $after: String) {
    data: articles(first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          author: authorV2 {
            bio
            email
            firstName
            lastName
            name
          }
          blog {
            id
          }
          comments(first: 250) {
            edges {
              node {
                author {
                  email
                  name
                }
                content
                contentHtml
                id
              }
            }
          }
          content
          contentHtml
          excerpt
          excerptHtml
          handle
          id
          image {
            altText
            id
            originalSrc
          }
          publishedAt
          seo {
            description
            title
          }
          tags
          title
          url
        }
      }
    }
  }
`;
exports.ARTICLES_QUERY = ARTICLES_QUERY;
const BLOGS_QUERY = `
  query GetBlogs($first: Int!, $after: String) {
    data: blogs(first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          authors {
            email
          }
          handle
          id
          title
          url
        }
      }
    }
  }
`;
exports.BLOGS_QUERY = BLOGS_QUERY;
const COLLECTIONS_QUERY = `
  query GetCollections($first: Int!, $after: String) {
    data: collections (first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          description
          descriptionHtml
          handle
          id
          image {
            altText
            id
            originalSrc
          }
          title
          updatedAt
          products(sortKey: COLLECTION_DEFAULT, first: 250) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`;
exports.COLLECTIONS_QUERY = COLLECTIONS_QUERY;
const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    data: products (first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          collections (first: $first) {
            edges {
              node {
                id
              }
            }
          }
          images(first: 250) {
            edges {
              node {
                id
                altText
                originalSrc
              }
            }
          }
          variants(first: 250) {
            edges {
              node {
                availableForSale
                compareAtPrice: compareAtPriceV2 {
                  amount
                  currencyCode
                }
                id
                image {
                  altText
                  id
                  originalSrc
                }
                price: priceV2 {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
                sku
                title
                weight
                weightUnit
              }
            }
          }
          availableForSale
          createdAt
          description
          descriptionHtml
          handle
          id
          onlineStoreUrl
          options {
            id
            name
            values
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          productType
          publishedAt
          tags
          title
          updatedAt
          vendor
          metafields(first: 250) {
            edges {
              node {
                key
                value
              }
            }
          }
        }
      }
    }
  }
`;
exports.PRODUCTS_QUERY = PRODUCTS_QUERY;
const SHOP_POLICIES_QUERY = `
  query GetPolicies {
    shop {
      privacyPolicy {
        body
        handle
        id
        title
        url
      }
      refundPolicy {
        body
        handle
        id
        title
        url
      }
      termsOfService {
        body
        handle
        id
        title
        url
      }
    }
  }
`;
exports.SHOP_POLICIES_QUERY = SHOP_POLICIES_QUERY;
const PRODUCT_TYPES_QUERY = `
  query GetProductTypes($first: Int!) {
    data: productTypes(first: $first) {
      pageInfo {
        hasNextPage
      }
      edges {
        node
      }
    }
  }
`;
exports.PRODUCT_TYPES_QUERY = PRODUCT_TYPES_QUERY;
const PAGES_QUERY = `
  query Pages ($first: Int!) {
    data: pages (first: $first) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          title
          handle
          body
          bodySummary
        }
      }
    }
  }
`;
exports.PAGES_QUERY = PAGES_QUERY;