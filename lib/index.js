"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _camelcase = _interopRequireDefault(require("camelcase"));

var _nanoid = require("nanoid");

var _client = require("./client");

var _schema = require("./schema");

var _queries = require("./queries");

class ShopifySource {
  static defaultOptions() {
    return {
      storeName: "",
      storeUrl: "",
      storefrontToken: "",
      typeName: "Shopify",
      types: [],
      perPage: 100
    };
  }

  constructor(api, options) {
    this.options = options;
    if (!options.storeUrl && !options.storeName) throw new Error("Missing store name or url.");
    if (!options.storefrontToken) throw new Error("Missing storefront access token.");
    if (options.storeName) this.options.storeUrl = `https://${options.storeName}.myshopify.com`; // Node Types

    this.TYPENAMES = {
      ARTICLE: this.createTypeName("Article"),
      BLOG: this.createTypeName("Blog"),
      COLLECTION: this.createTypeName("Collection"),
      PRODUCT: this.createTypeName("Product"),
      PRODUCT_VARIANT: this.createTypeName("ProductVariant"),
      PAGE: this.createTypeName("Page"),
      PRODUCT_TYPE: this.createTypeName("ProductType"),
      IMAGE: "ShopifyImage",
      PRICE: "ShopifyPrice"
    }; // Set included types

    this.typesToInclude = options.types.length ? options.types.map(type => this.createTypeName(type)) : Object.values(this.TYPENAMES);
    this.shopify = (0, _client.createClient)(options); // Create custom schema type for ShopifyImage

    api.loadSource(actions => {
      (0, _schema.createSchema)(actions, {
        TYPENAMES: this.TYPENAMES
      });
    }); // Load data into store

    api.loadSource(async actions => {
      console.log(`Loading data from ${options.storeUrl}`);
      await this.setupStore(actions);
      await this.getProductTypes(actions);
      await this.getCollections(actions);
      await this.getProducts(actions);
      await this.getBlogs(actions);
      await this.getArticles(actions);
      await this.getPages(actions);
    });
  }

  async setupStore(actions) {
    actions.addCollection({
      typeName: this.TYPENAMES.PRICE
    });
    actions.addCollection({
      typeName: this.TYPENAMES.IMAGE
    });
  }

  async getProductTypes(actions) {
    if (!this.typesToInclude.includes(this.TYPENAMES.PRODUCT_TYPE)) return;
    const productTypeStore = actions.addCollection({
      typeName: this.TYPENAMES.PRODUCT_TYPE
    });
    const allProductTypes = await (0, _client.queryAll)(this.shopify, _queries.PRODUCT_TYPES_QUERY, this.options.perPage);

    for (const productType of allProductTypes) {
      if (productType) productTypeStore.addNode({
        title: productType
      });
    }
  }

  async getCollections(actions) {
    if (!this.typesToInclude.includes(this.TYPENAMES.COLLECTION)) return;
    const imageStore = actions.getCollection(this.TYPENAMES.IMAGE);
    const collectionStore = actions.addCollection({
      typeName: this.TYPENAMES.COLLECTION
    });
    collectionStore.addReference("products", this.TYPENAMES.PRODUCT);
    const allCollections = await (0, _client.queryCollectionAll)(this.shopify, _queries.COLLECTIONS_QUERY, this.options.perPage);

    for (const collection of allCollections) {
      if (this.typesToInclude.includes(this.TYPENAMES.PRODUCT)) {
        const productNodes = collection.products.edges.map(({
          node: product
        }) => product.id);
        collection.products = productNodes;
      }

      if (collection.image) {
        const collectionImage = imageStore.addNode(collection.image);
        collection.image = actions.createReference(collectionImage);
      }

      collectionStore.addNode(collection);
    }
  }

  async getProducts(actions) {
    if (!this.typesToInclude.includes(this.TYPENAMES.PRODUCT)) return;
    const productStore = actions.addCollection({
      typeName: this.TYPENAMES.PRODUCT
    });
    const productVariantStore = actions.addCollection({
      typeName: this.TYPENAMES.PRODUCT_VARIANT
    });
    const imageStore = actions.getCollection(this.TYPENAMES.IMAGE);
    const priceStore = actions.getCollection(this.TYPENAMES.PRICE);
    const allProducts = await (0, _client.queryAll)(this.shopify, _queries.PRODUCTS_QUERY, this.options.perPage);

    for (const product of allProducts) {
      if (this.typesToInclude.includes(this.TYPENAMES.COLLECTION)) {
        product.collections = product.collections.edges.map(({
          node: collection
        }) => {
          return actions.createReference(this.TYPENAMES.COLLECTION, collection.id);
        });
      }

      const priceRange = this.getProductPriceRanges(product, actions);
      const images = product.images.edges.map(({
        node: image
      }) => {
        const productImage = imageStore.addNode(image);
        return actions.createReference(productImage);
      });
      const variants = product.variants.edges.map(({
        node: variant
      }) => {
        if (variant.image) {
          variant.image = actions.createReference(this.TYPENAMES.IMAGE, variant.image.id);
        }

        const variantPrice = priceStore.addNode({
          id: (0, _nanoid.nanoid)(),
          ...variant.price
        });
        variant.price = actions.createReference(variantPrice);
        const variantNode = productVariantStore.addNode(variant);
        return actions.createReference(variantNode);
      });
      productStore.addNode({ ...product,
        priceRange,
        variants,
        images
      });
    }
  }

  getProductPriceRanges(product, actions) {
    const priceStore = actions.getCollection(this.TYPENAMES.PRICE);
    const minVariantPrice = priceStore.addNode({
      id: (0, _nanoid.nanoid)(),
      ...product.priceRange.minVariantPrice
    });
    const maxVariantPrice = priceStore.addNode({
      id: (0, _nanoid.nanoid)(),
      ...product.priceRange.maxVariantPrice
    });
    return {
      minVariantPrice: actions.createReference(minVariantPrice),
      maxVariantPrice: actions.createReference(maxVariantPrice)
    };
  }

  async getBlogs(actions) {
    if (!this.typesToInclude.includes(this.TYPENAMES.BLOG)) return;
    const blogStore = actions.addCollection({
      typeName: this.TYPENAMES.BLOG
    });
    const allBlogs = await (0, _client.queryAll)(this.shopify, _queries.BLOGS_QUERY, this.options.perPage);

    for (const blog of allBlogs) {
      blogStore.addNode(blog);
    }
  }

  async getArticles(actions) {
    if (!this.typesToInclude.includes(this.TYPENAMES.ARTICLE)) return;
    const articleStore = actions.addCollection({
      typeName: this.TYPENAMES.ARTICLE
    });
    const imageStore = actions.getCollection(this.TYPENAMES.IMAGE);
    const allArticles = await (0, _client.queryAll)(this.shopify, _queries.ARTICLES_QUERY, this.options.perPage);

    for (const article of allArticles) {
      if (article.image) {
        const articleImage = imageStore.addNode(article.image);
        article.image = actions.createReference(articleImage);
      }

      if (this.typesToInclude.includes(this.TYPENAMES.BLOG)) {
        article.blog = actions.createReference(this.TYPENAMES.BLOG, article.blog.id);
      }

      articleStore.addNode(article);
    }
  }

  async getPages(actions) {
    if (!this.typesToInclude.includes(this.TYPENAMES.PAGE)) return;
    const pageStore = actions.addCollection({
      typeName: this.TYPENAMES.PAGE
    });
    const allPages = await (0, _client.queryAll)(this.shopify, _queries.PAGES_QUERY, this.options.perPage);

    for (const page of allPages) {
      pageStore.addNode(page);
    }
  }

  createTypeName(name) {
    let typeName = this.options.typeName; // If typeName is blank, we need to add a preifx to these types anyway, as on their own they conflict with internal Gridsome types.

    const types = ["Page"];
    if (!typeName && types.includes(name)) typeName = "Shopify";
    return (0, _camelcase.default)(`${typeName} ${name}`, {
      pascalCase: true
    });
  }

}

module.exports = ShopifySource;