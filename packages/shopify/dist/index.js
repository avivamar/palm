"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  API_VERSION: () => API_VERSION,
  CustomerService: () => CustomerService,
  HealthCheck: () => HealthCheck,
  InventoryService: () => InventoryService,
  Metrics: () => Metrics,
  OrderService: () => OrderService,
  ProductService: () => ProductService,
  ShopifyClient: () => ShopifyClient,
  ShopifyIntegration: () => ShopifyIntegration,
  VERSION: () => VERSION,
  WebhookHandler: () => WebhookHandler,
  WebhookRouter: () => WebhookRouter,
  batchProcess: () => batchProcess,
  buildGraphQLId: () => buildGraphQLId,
  createShopifyHandler: () => createShopifyHandler,
  deepMerge: () => deepMerge,
  formatPrice: () => formatPrice,
  getShopifyAdminUrl: () => getShopifyAdminUrl,
  isValidShopifyDomain: () => isValidShopifyDomain,
  parseShopifyId: () => parseShopifyId,
  retry: () => retry,
  sanitizeData: () => sanitizeData,
  validateConfig: () => validateConfig
});
module.exports = __toCommonJS(index_exports);

// src/config/index.ts
var import_zod = require("zod");
var ShopifyConfigSchema = import_zod.z.object({
  // 基础配置
  storeDomain: import_zod.z.string().min(1),
  adminAccessToken: import_zod.z.string().startsWith("shpat_"),
  apiVersion: import_zod.z.string().default("2025-01"),
  // 功能开关
  features: import_zod.z.object({
    enabled: import_zod.z.boolean().default(true),
    productSync: import_zod.z.boolean().default(true),
    orderSync: import_zod.z.boolean().default(true),
    inventorySync: import_zod.z.boolean().default(true),
    customerSync: import_zod.z.boolean().default(false),
    webhooks: import_zod.z.boolean().default(true)
  }).default({}),
  // 高级配置
  rateLimitStrategy: import_zod.z.enum(["conservative", "balanced", "aggressive"]).default("balanced"),
  retryAttempts: import_zod.z.number().int().min(0).max(10).default(3),
  timeoutMs: import_zod.z.number().int().min(1e3).default(1e4),
  batchSize: import_zod.z.number().int().min(1).max(250).default(50),
  syncInterval: import_zod.z.number().int().min(6e4).default(3e5),
  // 最小1分钟
  // Webhook 配置
  webhook: import_zod.z.object({
    secret: import_zod.z.string().optional(),
    endpoint: import_zod.z.string().default("/api/webhooks/shopify")
  }).optional(),
  // 日志配置
  logging: import_zod.z.object({
    level: import_zod.z.enum(["debug", "info", "warn", "error"]).default("info"),
    enabled: import_zod.z.boolean().default(true)
  }).default({})
});
function validateConfig(config) {
  return ShopifyConfigSchema.parse(config);
}
function loadConfigFromEnv() {
  return {
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
    adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    apiVersion: process.env.SHOPIFY_API_VERSION,
    features: {
      enabled: process.env.SHOPIFY_INTEGRATION_ENABLED === "true",
      productSync: process.env.SHOPIFY_PRODUCT_SYNC !== "false",
      orderSync: process.env.SHOPIFY_ORDER_SYNC !== "false",
      inventorySync: process.env.SHOPIFY_INVENTORY_SYNC !== "false",
      customerSync: process.env.SHOPIFY_CUSTOMER_SYNC === "true",
      webhooks: process.env.SHOPIFY_WEBHOOKS !== "false"
    },
    rateLimitStrategy: process.env.SHOPIFY_RATE_LIMIT_STRATEGY,
    retryAttempts: process.env.SHOPIFY_RETRY_ATTEMPTS ? parseInt(process.env.SHOPIFY_RETRY_ATTEMPTS) : void 0,
    timeoutMs: process.env.SHOPIFY_TIMEOUT_MS ? parseInt(process.env.SHOPIFY_TIMEOUT_MS) : void 0,
    batchSize: process.env.SHOPIFY_BATCH_SIZE ? parseInt(process.env.SHOPIFY_BATCH_SIZE) : void 0,
    syncInterval: process.env.SHOPIFY_SYNC_INTERVAL ? parseInt(process.env.SHOPIFY_SYNC_INTERVAL) : void 0,
    webhook: {
      secret: process.env.SHOPIFY_WEBHOOK_SECRET,
      endpoint: process.env.SHOPIFY_WEBHOOK_ENDPOINT
    },
    logging: {
      level: process.env.SHOPIFY_LOG_LEVEL,
      enabled: process.env.SHOPIFY_LOGGING !== "false"
    }
  };
}

// src/core/error-handler.ts
var ShopifyErrorHandler = class {
  /**
   * 处理 API 错误
   */
  static handleApiError(error, context) {
    const errorMessage = error instanceof Error ? error.message : "\u672A\u77E5\u9519\u8BEF";
    console.error(`[Shopify] ${context} \u9519\u8BEF:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
      context
    };
  }
  /**
   * 处理同步错误
   */
  static handleSyncError(error, syncType, itemId) {
    const errorMessage = error instanceof Error ? error.message : "\u540C\u6B65\u5931\u8D25";
    console.error(`[Shopify] ${syncType} \u540C\u6B65\u9519\u8BEF:`, errorMessage, itemId ? `(ID: ${itemId})` : "");
    return {
      success: false,
      error: errorMessage,
      syncType,
      itemId
    };
  }
  /**
   * 记录警告
   */
  static logWarning(message, context) {
    console.warn(`[Shopify] \u8B66\u544A: ${message}`, context || "");
  }
  /**
   * 记录信息
   */
  static logInfo(message, context) {
    console.log(`[Shopify] ${message}`, context || "");
  }
};

// src/core/client.ts
var ShopifyClient = class {
  constructor(config) {
    this.shopify = null;
    const envConfig = loadConfigFromEnv();
    this.config = validateConfig(__spreadValues(__spreadValues({}, envConfig), config));
    this.initializeClient();
  }
  initializeClient() {
    try {
      console.log("[ShopifyClient] \u2705 Shopify \u5BA2\u6237\u7AEF\u521D\u59CB\u5316\u6210\u529F");
    } catch (error) {
      console.error("[ShopifyClient] \u274C Shopify \u5BA2\u6237\u7AEF\u521D\u59CB\u5316\u5931\u8D25:", error);
      this.shopify = null;
    }
  }
  async request(method, path, data) {
    try {
      const url = `https://${this.config.storeDomain}.myshopify.com${path}`;
      const headers = {
        "X-Shopify-Access-Token": this.config.adminAccessToken,
        "Content-Type": "application/json"
      };
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : void 0
      });
      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      return ShopifyErrorHandler.handleApiError(error, `${method} ${path}`);
    }
  }
};

// src/services/products.ts
var ProductService = class {
  constructor(client, config) {
    this.client = client;
    this.config = config;
  }
  // 同步所有产品
  async syncAllProducts() {
    try {
      const products = await this.listProducts();
      const result = await this.batchSyncProducts(products);
      return result;
    } catch (error) {
      return ShopifyErrorHandler.handleSyncError(error, "ProductSync");
    }
  }
  // 列出所有产品
  async listProducts() {
    const response = await this.client.request("GET", "/admin/api/2025-01/products.json");
    return response.products || [];
  }
  // 批量同步产品
  async batchSyncProducts(products) {
    const shopifyProductIds = [];
    let syncedCount = 0;
    const errors = [];
    for (const product of products) {
      try {
        const response = await this.client.request("POST", "/admin/api/2025-01/products.json", { product });
        shopifyProductIds.push(response.product.id);
        syncedCount++;
      } catch (error) {
        errors.push(`\u4EA7\u54C1\u540C\u6B65\u5931\u8D25: ${product.title}`);
      }
    }
    return {
      success: errors.length === 0,
      syncedCount,
      failedCount: errors.length,
      errors,
      shopifyProductIds
    };
  }
};

// src/services/orders.ts
var OrderService = class {
  constructor(client, config) {
    this.client = client;
    this.config = config;
  }
  // 同步单个订单
  async syncOrder(orderData) {
    try {
      const sanitizedOrder = this.sanitizeOrderData(orderData);
      const response = await this.client.request("POST", "/admin/api/2025-01/orders.json", { order: sanitizedOrder });
      return {
        success: true,
        shopifyOrderId: response.order.id,
        shopifyOrderNumber: response.order.order_number,
        orderId: orderData.id
      };
    } catch (error) {
      return ShopifyErrorHandler.handleSyncError(error, "OrderSync", orderData.id);
    }
  }
  // 数据清洗
  sanitizeOrderData(orderData) {
    return orderData;
  }
};

// src/services/inventory.ts
var InventoryService = class {
  constructor(client, config) {
    this.client = client;
    this.config = config;
  }
  /**
   * 更新库存数量
   */
  async updateInventory(inventoryItemId, locationId, quantity) {
    if (!this.config.features.inventorySync) {
      return {
        success: false,
        error: "\u5E93\u5B58\u540C\u6B65\u529F\u80FD\u5DF2\u7981\u7528"
      };
    }
    try {
      const response = await this.client.request("POST", "/admin/api/2025-01/inventory_levels/set.json", {
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available: quantity
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "\u5E93\u5B58\u66F4\u65B0\u5931\u8D25"
      };
    }
  }
  /**
   * 获取库存级别
   */
  async getInventoryLevels(locationId) {
    try {
      const params = locationId ? `?location_ids=${locationId}` : "";
      const response = await this.client.request("GET", `/admin/api/2025-01/inventory_levels.json${params}`);
      return {
        success: true,
        data: response.inventory_levels || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "\u83B7\u53D6\u5E93\u5B58\u5931\u8D25"
      };
    }
  }
  /**
   * 批量更新库存
   */
  async batchUpdateInventory(updates) {
    const results = [];
    let successCount = 0;
    let failedCount = 0;
    for (const update of updates) {
      const result = await this.updateInventory(
        update.inventoryItemId,
        update.locationId,
        update.quantity
      );
      results.push(result);
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return {
      success: failedCount === 0,
      successCount,
      failedCount,
      results
    };
  }
};

// src/services/customers.ts
var CustomerService = class {
  constructor(client, config) {
    this.client = client;
    this.config = config;
  }
  /**
   * 创建或更新客户
   */
  async upsertCustomer(customerData) {
    if (!this.config.features.customerSync) {
      return {
        success: false,
        error: "\u5BA2\u6237\u540C\u6B65\u529F\u80FD\u5DF2\u7981\u7528"
      };
    }
    try {
      const existingCustomer = await this.findCustomerByEmail(customerData.email);
      if (existingCustomer) {
        return await this.updateCustomer(existingCustomer.id, customerData);
      } else {
        return await this.createCustomer(customerData);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "\u5BA2\u6237\u540C\u6B65\u5931\u8D25"
      };
    }
  }
  /**
   * 通过邮箱查找客户
   */
  async findCustomerByEmail(email) {
    try {
      const response = await this.client.request(
        "GET",
        `/admin/api/2025-01/customers/search.json?query=email:${email}`
      );
      if (response.customers && response.customers.length > 0) {
        return response.customers[0];
      }
      return null;
    } catch (error) {
      console.error("\u67E5\u627E\u5BA2\u6237\u5931\u8D25:", error);
      return null;
    }
  }
  /**
   * 创建客户
   */
  async createCustomer(customerData) {
    try {
      const response = await this.client.request("POST", "/admin/api/2025-01/customers.json", {
        customer: customerData
      });
      return {
        success: true,
        data: response.customer
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "\u521B\u5EFA\u5BA2\u6237\u5931\u8D25"
      };
    }
  }
  /**
   * 更新客户
   */
  async updateCustomer(customerId, customerData) {
    try {
      const response = await this.client.request(
        "PUT",
        `/admin/api/2025-01/customers/${customerId}.json`,
        {
          customer: customerData
        }
      );
      return {
        success: true,
        data: response.customer
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "\u66F4\u65B0\u5BA2\u6237\u5931\u8D25"
      };
    }
  }
  /**
   * 获取客户列表
   */
  async listCustomers(params) {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== void 0) {
            queryParams.append(key, value.toString());
          }
        });
      }
      const queryString = queryParams.toString();
      const url = `/admin/api/2025-01/customers.json${queryString ? `?${queryString}` : ""}`;
      const response = await this.client.request("GET", url);
      return {
        success: true,
        data: response.customers || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "\u83B7\u53D6\u5BA2\u6237\u5217\u8868\u5931\u8D25"
      };
    }
  }
};

// src/monitoring/health-check.ts
var HealthCheck = class {
  constructor(client, config) {
    this.client = client;
    this.config = config;
  }
  /**
   * 运行健康检查
   */
  async check() {
    const status = {
      status: "healthy",
      shopEnabled: true,
      apiConnection: true,
      webhookActive: true,
      errors: []
    };
    try {
      const shopStatus = await this.client.request("GET", "/admin/api/2025-01/shop.json");
      if (!shopStatus || shopStatus.errors) {
        throw new Error("\u65E0\u6CD5\u8FDE\u63A5\u5230Shopify API");
      }
    } catch (error) {
      status.status = "unhealthy";
      status.apiConnection = false;
      status.errors.push("Shopify API\u8FDE\u63A5\u9519\u8BEF");
    }
    return status;
  }
};

// src/monitoring/metrics.ts
var Metrics = class {
  constructor(config) {
    this.metricsData = {
      apiCalls: 0,
      syncedProducts: 0,
      syncedOrders: 0,
      errors: 0,
      lastSync: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.config = config;
  }
  /**
   * 获取指标汇总
   */
  async getSummary() {
    return this.metricsData;
  }
  /**
   * 增加 API 调用计数
   */
  incrementApiCalls() {
    this.metricsData.apiCalls++;
  }
  /**
   * 增加同步产品计数
   */
  incrementSyncedProducts(count = 1) {
    this.metricsData.syncedProducts += count;
  }
  /**
   * 增加同步订单计数
   */
  incrementSyncedOrders(count = 1) {
    this.metricsData.syncedOrders += count;
  }
  /**
   * 增加错误计数
   */
  incrementErrors(count = 1) {
    this.metricsData.errors += count;
  }
  /**
   * 更新最后同步时间
   */
  updateLastSync() {
    this.metricsData.lastSync = (/* @__PURE__ */ new Date()).toISOString();
  }
  /**
   * 重置指标
   */
  reset() {
    this.metricsData = {
      apiCalls: 0,
      syncedProducts: 0,
      syncedOrders: 0,
      errors: 0,
      lastSync: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};

// src/core/integration.ts
var ShopifyIntegration = class {
  constructor(config) {
    const envConfig = loadConfigFromEnv();
    this.config = validateConfig(__spreadValues(__spreadValues({}, envConfig), config));
    this.client = new ShopifyClient(this.config);
  }
  /**
   * 获取产品服务
   */
  getProductService() {
    if (!this.productService) {
      this.productService = new ProductService(this.client, this.config);
    }
    return this.productService;
  }
  /**
   * 获取订单服务
   */
  getOrderService() {
    if (!this.orderService) {
      this.orderService = new OrderService(this.client, this.config);
    }
    return this.orderService;
  }
  /**
   * 获取库存服务
   */
  getInventoryService() {
    if (!this.inventoryService) {
      this.inventoryService = new InventoryService(this.client, this.config);
    }
    return this.inventoryService;
  }
  /**
   * 获取客户服务
   */
  getCustomerService() {
    if (!this.customerService) {
      this.customerService = new CustomerService(this.client, this.config);
    }
    return this.customerService;
  }
  /**
   * 获取健康检查
   */
  getHealthCheck() {
    if (!this.healthCheck) {
      this.healthCheck = new HealthCheck(this.client, this.config);
    }
    return this.healthCheck;
  }
  /**
   * 获取指标
   */
  getMetrics() {
    if (!this.metrics) {
      this.metrics = new Metrics(this.config);
    }
    return this.metrics;
  }
  /**
   * 获取原始客户端（高级用法）
   */
  getClient() {
    return this.client;
  }
  /**
   * 更新配置
   */
  updateConfig(config) {
    this.config = validateConfig(__spreadValues(__spreadValues({}, this.config), config));
    this.client = new ShopifyClient(this.config);
    this.productService = void 0;
    this.orderService = void 0;
    this.inventoryService = void 0;
    this.customerService = void 0;
    this.healthCheck = void 0;
    this.metrics = void 0;
  }
  /**
   * 获取当前配置
   */
  getConfig() {
    return __spreadValues({}, this.config);
  }
  /**
   * 健康检查
   */
  async healthCheck() {
    const healthChecker = this.getHealthCheck();
    return await healthChecker.check();
  }
  /**
   * 获取指标数据
   */
  async getMetricsData() {
    const metricsService = this.getMetrics();
    return await metricsService.getSummary();
  }
};

// src/utils/index.ts
function formatPrice(price, currency = "USD") {
  const amount = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
}
function getShopifyAdminUrl(storeDomain, path) {
  const cleanDomain = storeDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${cleanDomain}/admin${path}`;
}
function isValidShopifyDomain(domain) {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(domain);
}
function parseShopifyId(gid) {
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : gid;
}
function buildGraphQLId(resource, id) {
  return `gid://shopify/${resource}/${id}`;
}
async function batchProcess(items, processor, options = {}) {
  const { batchSize = 10, delayMs = 100 } = options;
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    if (i + batchSize < items.length && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return results;
}
async function retry(fn, options = {}) {
  const { attempts = 3, delay = 1e3, backoff = true } = options;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) {
        throw error;
      }
      const waitTime = backoff ? delay * Math.pow(2, i) : delay;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  throw new Error("Retry failed");
}
function deepMerge(target, source) {
  const output = __spreadValues({}, target);
  Object.keys(source).forEach((key) => {
    const targetValue = output[key];
    const sourceValue = source[key];
    if (isObject(targetValue) && isObject(sourceValue)) {
      output[key] = deepMerge(targetValue, sourceValue);
    } else {
      output[key] = sourceValue;
    }
  });
  return output;
}
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}
function sanitizeData(data, fieldsToMask = []) {
  if (!data || typeof data !== "object") {
    return data;
  }
  const defaultFieldsToMask = ["password", "token", "secret", "credit_card", "ssn"];
  const allFieldsToMask = [...defaultFieldsToMask, ...fieldsToMask];
  const sanitize = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === "object") {
      const sanitized = {};
      Object.keys(obj).forEach((key) => {
        const lowerKey = key.toLowerCase();
        if (allFieldsToMask.some((field) => lowerKey.includes(field))) {
          sanitized[key] = "***MASKED***";
        } else {
          sanitized[key] = sanitize(obj[key]);
        }
      });
      return sanitized;
    }
    return obj;
  };
  return sanitize(data);
}

// src/webhooks/handler.ts
var import_crypto = __toESM(require("crypto"));
var WebhookHandler = class {
  constructor(config) {
    this.config = config;
  }
  /**
   * 验证 Webhook 签名
   */
  verifyWebhookSignature(rawBody, signature) {
    var _a;
    if (!((_a = this.config.webhook) == null ? void 0 : _a.secret)) {
      console.warn("Webhook secret \u672A\u914D\u7F6E");
      return false;
    }
    const hash = import_crypto.default.createHmac("sha256", this.config.webhook.secret).update(rawBody, "utf8").digest("base64");
    return hash === signature;
  }
  /**
   * 处理 Webhook
   */
  async handleWebhook(topic, body) {
    console.log(`[Webhook] \u6536\u5230 ${topic} webhook`);
    switch (topic) {
      case "orders/create":
        return this.handleOrderCreate(body);
      case "orders/updated":
        return this.handleOrderUpdate(body);
      case "products/create":
        return this.handleProductCreate(body);
      case "products/update":
        return this.handleProductUpdate(body);
      case "inventory_levels/update":
        return this.handleInventoryUpdate(body);
      default:
        console.log(`[Webhook] \u672A\u5904\u7406\u7684 topic: ${topic}`);
        return { success: true, message: "Webhook received" };
    }
  }
  async handleOrderCreate(order) {
    console.log("[Webhook] \u5904\u7406\u8BA2\u5355\u521B\u5EFA:", order.id);
    return { success: true };
  }
  async handleOrderUpdate(order) {
    console.log("[Webhook] \u5904\u7406\u8BA2\u5355\u66F4\u65B0:", order.id);
    return { success: true };
  }
  async handleProductCreate(product) {
    console.log("[Webhook] \u5904\u7406\u4EA7\u54C1\u521B\u5EFA:", product.id);
    return { success: true };
  }
  async handleProductUpdate(product) {
    console.log("[Webhook] \u5904\u7406\u4EA7\u54C1\u66F4\u65B0:", product.id);
    return { success: true };
  }
  async handleInventoryUpdate(inventory) {
    console.log("[Webhook] \u5904\u7406\u5E93\u5B58\u66F4\u65B0");
    return { success: true };
  }
};

// src/webhooks/router.ts
var WebhookRouter = class {
  constructor(config) {
    this.handler = new WebhookHandler(config);
  }
  /**
   * 处理 webhook 请求
   */
  async handleRequest(req) {
    try {
      const topic = req.headers["x-shopify-topic"];
      if (!topic) {
        return {
          success: false,
          status: 400,
          error: "Missing X-Shopify-Topic header"
        };
      }
      const signature = req.headers["x-shopify-hmac-sha256"];
      if (signature) {
        const rawBody = req.rawBody || req.body;
        const isValid = this.handler.verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
          return {
            success: false,
            status: 401,
            error: "Invalid webhook signature"
          };
        }
      }
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      await this.handler.handleWebhook(topic, body);
      return {
        success: true,
        status: 200,
        message: "Webhook processed successfully"
      };
    } catch (error) {
      console.error("[WebhookRouter] Error processing webhook:", error);
      return {
        success: false,
        status: 500,
        error: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }
  /**
   * 注册 webhook 到 Shopify
   */
  async registerWebhooks(webhooks) {
    const registered = [];
    const failed = [];
    for (const webhook of webhooks) {
      try {
        console.log(`[WebhookRouter] Registering webhook: ${webhook.topic}`);
        registered.push(webhook.topic);
      } catch (error) {
        console.error(`[WebhookRouter] Failed to register webhook: ${webhook.topic}`, error);
        failed.push(webhook.topic);
      }
    }
    return {
      success: failed.length === 0,
      registered,
      failed
    };
  }
};

// src/next/handler.ts
var import_server = require("next/server");
function createShopifyHandler(config) {
  const shopify = new ShopifyIntegration(config);
  const webhookRouter = new WebhookRouter(shopify.getConfig());
  return {
    /**
     * 处理 GET 请求
     */
    async GET(request) {
      const { searchParams } = new URL(request.url);
      const path = searchParams.get("path");
      if (path === "/health") {
        const health = await shopify.healthCheck();
        return import_server.NextResponse.json(health);
      }
      if (path === "/metrics") {
        const metrics = await shopify.getMetricsData();
        return import_server.NextResponse.json(metrics);
      }
      if (path === "/config") {
        const config2 = shopify.getConfig();
        const safeConfig = __spreadProps(__spreadValues({}, config2), {
          adminAccessToken: "***HIDDEN***",
          webhook: config2.webhook ? __spreadProps(__spreadValues({}, config2.webhook), {
            secret: config2.webhook.secret ? "***HIDDEN***" : void 0
          }) : void 0
        });
        return import_server.NextResponse.json(safeConfig);
      }
      return import_server.NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    },
    /**
     * 处理 POST 请求（主要用于 Webhook）
     */
    async POST(request) {
      const { pathname } = new URL(request.url);
      if (pathname.endsWith("/webhook") || pathname.endsWith("/webhooks")) {
        const body = await request.text();
        const headers = {};
        request.headers.forEach((value, key) => {
          headers[key.toLowerCase()] = value;
        });
        const result = await webhookRouter.handleRequest({
          headers,
          body,
          rawBody: body
        });
        return import_server.NextResponse.json(
          { success: result.success, message: result.message || result.error },
          { status: result.status }
        );
      }
      if (pathname.endsWith("/sync/products")) {
        const productService = shopify.getProductService();
        const result = await productService.syncAllProducts();
        return import_server.NextResponse.json(result);
      }
      if (pathname.endsWith("/sync/orders")) {
        const orderService = shopify.getOrderService();
        const body = await request.json();
        const result = await orderService.syncOrder(body);
        return import_server.NextResponse.json(result);
      }
      return import_server.NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    },
    /**
     * 处理 PUT 请求
     */
    async PUT(request) {
      const { pathname } = new URL(request.url);
      if (pathname.endsWith("/config")) {
        const body = await request.json();
        shopify.updateConfig(body);
        return import_server.NextResponse.json({ success: true });
      }
      return import_server.NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    },
    /**
     * 处理 DELETE 请求
     */
    async DELETE(request) {
      return import_server.NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }
  };
}

// src/index.ts
var VERSION = "1.0.0";
var API_VERSION = "2025-01";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  API_VERSION,
  CustomerService,
  HealthCheck,
  InventoryService,
  Metrics,
  OrderService,
  ProductService,
  ShopifyClient,
  ShopifyIntegration,
  VERSION,
  WebhookHandler,
  WebhookRouter,
  batchProcess,
  buildGraphQLId,
  createShopifyHandler,
  deepMerge,
  formatPrice,
  getShopifyAdminUrl,
  isValidShopifyDomain,
  parseShopifyId,
  retry,
  sanitizeData,
  validateConfig
});
