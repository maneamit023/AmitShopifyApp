import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
  LATEST_API_VERSION,
} from "@shopify/shopify-app-remix";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-07";
import prisma from "./db.server";
import axios from "axios";
import "./connection";

// const { PrismaClient } = require("@prisma/client");
// let prisma = new PrismaClient();

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });

      // await reportData(session);
      // Inject code into theme.liquid
      await injectCustomCode(session);
      await injectNewFile(session)

      const express = require("express");
      const app = express();
      const cors = require("cors");
      const port = 3001;
      app.use(express.json());
      app.use(cors());

      //to add button above add to cart
      app.get("/api/aboveAddToCart", (req, res) => {
        addAbove();
        res.json({
          message: "Congrats!, FIND MY FIT added before Add to Cart",
        });
      });
      app.get("/api/belowAddToCart", (req, res) => {
        addBelow();
        res.json({ message: "Congrats!, FIND MY FIT added after Add to Cart" });
      });

      app.get("/api/getAllOrders", async (req, res) => {
        try {
          const orders = await getOrders();
          res.json({ orders: orders });
        } catch (error) {
          res.json({ error });
        }
      });

      app.get("/api/getAllProductsFromPortal", async (req, res) => {
        try {
          const product = await getProduct();
          res.json({ product: product });
          console.log("inside node api :", product);
        } catch (error) {
          res.json({ error });
        }
      });

      app.listen(port, () => {
        console.log(`Server is running on on port ${port}`);
      });

      // to add button above add to cart
      function addAbove() {
        // console.log("tesing......");
        addAboveAddToCart(session);
        // console.log("called on button click...!");
      }

      //to add button below add to cart
      function addBelow() {
        // console.log("tesing......");
        addBelowAddToCart(session);
        // console.log("called on button click...!");
      }

      async function getOrders() {
        console.log("get order called");
        try {
          const orders = await Orders(session);
          return orders;
        } catch (error) {
          console.error("Error in getOrders:", error);
          throw error;
        }
      }

      async function getProduct() {
        try {
          console.log("inside get product function");
          const portalProduct = await ProductList(session);
          if (!Array.isArray(portalProduct)) {
            throw new Error("Product data is not an array.");
          }

          const productPromises = portalProduct.map(async (product) => {
            await prisma.product.upsert({
              where: { pid: product.id },
              update: {
                title: product.title,
                category: product.category
              },
              create: {
                pid: product.id,
                title: product.title,
                category: product.category
              },
            });

            await prisma.category_sizing.upsert({
              where: { id: product.id },
              update: {},
              create: {
                category: product.category,
                size_chart_url: product.size_chart_url || ''
              },
            });

          });

          await Promise.all(productPromises);
          // console.log("++++++++++++",productPromises);

          console.log("products updated or inserted");
        } catch (error) {
          console.error("Error in getProduct:", error);
          throw error;
        } finally {
          await shutdown();
        }
      }

    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

async function shutdown() {
  await prisma.$disconnect();
}



let themeId;

// Function to get theme id and inject code in both file
const injectCustomCode = async (session) => {
  try {
    const accessToken = session.accessToken;
    // const themeId = "131513811134";

    const themeListResponse = await axios.get(
      `https://${session.shop}/admin/api/${apiVersion}/themes.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );

    const themeList = themeListResponse.data.themes;
    console.log("theme list : ", themeList);
    // Determining which theme to update
    const targetTheme = themeList.find(
      (/** @type {{ role: string; }} */ theme) => theme.role === "main"
    );

    if (!targetTheme) {
      console.error("Main theme not found.");
      return;
    }

    themeId = targetTheme.id;
    console.log("theme id :", themeId);

    // Asset information for theme.liquid
    const assetKeyThemeFile = "layout/theme.liquid";
    const responseThemeFile = await axios.get(
      `https://${session.shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json?asset[key]=${assetKeyThemeFile}`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );
    const existingContentThemeFile = responseThemeFile.data.asset.value;

    // Modify content for both files
    const modifiedContentThemeFile =
      existingContentThemeFile +
      `
      <script src="https://lom-quiz-app.s3.us-east-2.amazonaws.com/bundles/development/v9/quidget-element.js" type="module"></script>
    `;

    // Update theme.liquid
    const assetUpdatePayloadThemeFile = {
      asset: {
        key: assetKeyThemeFile,
        value: modifiedContentThemeFile,
      },
    };
    await axios.put(
      `https://${session.shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json`,
      assetUpdatePayloadThemeFile,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );

    // Fetch content of main-product.liquid
    const assetKeyProductFile = "sections/main-product.liquid";
    const responseProductFile = await axios.get(
      `https://${session.shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json?asset[key]=${assetKeyProductFile}`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );
    let existingContentProductFile = responseProductFile.data.asset.value;

    // console.log("Access-Token", accessToken);
    // console.log("shop", session.shop);
    // for the location of the "Add to Cart" button
    const addToCartButtonMarker =
      "{%- if block.settings.show_dynamic_checkout -%}";
    const addToCartButtonIndex = existingContentProductFile.indexOf(
      addToCartButtonMarker
    );
    // console.log("addToCartButtonIndex",addToCartButtonIndex);

    if (addToCartButtonIndex === -1) {
      console.error("Add to Cart button marker not found");
      return;
    }

    // Insert modifiedContentProductFile after the "Add to Cart" button
    const modifiedContentProductFile = `
      <quidget-element partnerId='339ff0a4-3811-4b93-8911-5509945d1f23' productHandle='The Alpha' productCategory='WOMEN'> </quidget-element>
    `;

    existingContentProductFile =
      existingContentProductFile.slice(0, addToCartButtonIndex) +
      modifiedContentProductFile +
      existingContentProductFile.slice(addToCartButtonIndex);

    // Update main-product.liquid
    const assetUpdatePayloadProductFile = {
      asset: {
        key: assetKeyProductFile,
        value: existingContentProductFile,
      },
    };

    await axios.put(
      `https://${session.shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json`,
      assetUpdatePayloadProductFile,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );

    console.log("Custom code injected successfully into both files");
  } catch (error) {
    console.error("Error injecting custom code:", error);
  }
};

//to add new file
const injectNewFile = async (session) => {
  try {
    console.log("inside the injectCustomCode");
    const accessToken = session.accessToken;
    console.log("accessToken",accessToken);
    // const themeId = themeId;
    const assetKey = 'assets/DummyFile.js'; 
    const codeToInject = `
        <p>Hello from custom injection!</p>
        <h1>Custom file added</h1>
    `;

    // PUT request payload
    const assetUpdatePayload = {
      asset: {
        key: assetKey,
        value: codeToInject,
      },
    };

    // Make a PUT request to update the asset
    await axios.put(`https://${session.shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json`, assetUpdatePayload, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    });

    console.log('Custom file injected successfully');
  } catch (error) {
    console.error('Error injecting custom file:', error);
  }
};

//to add FIND MY FIT button above Add to Cart
const addAboveAddToCart = async (session) => {
  // console.log("call from api",session);
  try {
    const accessToken = session.accessToken;
    // const themeId = "131513811134";
    // Fetch content of main-product.liquid
    const assetKeyProductFile = "sections/main-product.liquid";
    const responseProductFile = await axios.get(
      `https://${session.shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json?asset[key]=${assetKeyProductFile}`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );
    let existingContentProductFile = responseProductFile.data.asset.value;

    // Check if the existing element to be removed from the file
    const textToRemove =
      "<quidget-element partnerId='339ff0a4-3811-4b93-8911-5509945d1f23' productHandle='The Alpha' productCategory='WOMEN'> </quidget-element>";
    if (existingContentProductFile.includes(textToRemove)) {
      // Remove the element from existingContentProductFile
      existingContentProductFile = existingContentProductFile.replace(
        textToRemove,
        ""
      );
    }

    // for the location of the "Add to Cart" button
    const addToCartButtonMarker =
      '<input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}" disabled>';
    const addToCartButtonIndex = existingContentProductFile.indexOf(
      addToCartButtonMarker
    );
    // console.log("addToCartButtonIndex", addToCartButtonIndex);

    if (addToCartButtonIndex === -1) {
      console.error("Add to Cart button marker not found");
      return;
    }

    // Insert modifiedContentProductFile after the "Add to Cart" button
    const modifiedContentProductFile = `
      <quidget-element partnerId='339ff0a4-3811-4b93-8911-5509945d1f23' productHandle='The Alpha' productCategory='WOMEN'> </quidget-element>
    `;

    existingContentProductFile =
      existingContentProductFile.slice(0, addToCartButtonIndex) +
      modifiedContentProductFile +
      existingContentProductFile.slice(addToCartButtonIndex);

    // Update main-product.liquid
    const assetUpdatePayloadProductFile = {
      asset: {
        key: assetKeyProductFile,
        value: existingContentProductFile,
      },
    };

    await axios.put(
      `https://${session.shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json`,
      assetUpdatePayloadProductFile,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );

    console.log("Custom code injected successfully before Add to Cart button");
  } catch (error) {
    console.error("Error injecting custom code:", error);
  }
};

//to add FIND MY FIT button below Add to Cart
const addBelowAddToCart = async (session) => {
  try {
    const accessToken = session.accessToken;
    // const themeId = "131513811134";
    // Fetch content of main-product.liquid
    const assetKeyProductFile = "sections/main-product.liquid";
    const responseProductFile = await axios.get(
      `https://${session.shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json?asset[key]=${assetKeyProductFile}`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );
    let existingContentProductFile = responseProductFile.data.asset.value;

    // Check if the existing element to be removed from the file
    const textToRemove =
      "<quidget-element partnerId='339ff0a4-3811-4b93-8911-5509945d1f23' productHandle='The Alpha' productCategory='WOMEN'> </quidget-element>";
    if (existingContentProductFile.includes(textToRemove)) {
      // Remove the element from existingContentProductFile
      existingContentProductFile = existingContentProductFile.replace(
        textToRemove,
        ""
      );
    }

    // for the location of the "Add to Cart" button
    const addToCartButtonMarker =
      "{%- if block.settings.show_dynamic_checkout -%}";
    const addToCartButtonIndex = existingContentProductFile.indexOf(
      addToCartButtonMarker
    );
    // console.log("addToCartButtonIndex", addToCartButtonIndex);

    if (addToCartButtonIndex === -1) {
      console.error("Add to Cart button marker not found");
      return;
    }

    // Insert modifiedContentProductFile after the "Add to Cart" button
    const modifiedContentProductFile = `
      <quidget-element partnerId='339ff0a4-3811-4b93-8911-5509945d1f23' productHandle='The Alpha' productCategory='WOMEN'> </quidget-element>
    `;

    existingContentProductFile =
      existingContentProductFile.slice(0, addToCartButtonIndex) +
      modifiedContentProductFile +
      existingContentProductFile.slice(addToCartButtonIndex);

    // Update main-product.liquid
    const assetUpdatePayloadProductFile = {
      asset: {
        key: assetKeyProductFile,
        value: existingContentProductFile,
      },
    };

    await axios.put(
      `https://${session.shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json`,
      assetUpdatePayloadProductFile,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );

    console.log("Custom code injected successfully before Add to Cart button");
  } catch (error) {
    console.error("Error injecting custom code:", error);
  }


};

// to get orders data
// const Orders = async (session) => {
//   try {
//     const accessToken = session.accessToken;

//     const ordersResponse = await axios.get(
//       `https://${session.shop}/admin/api/${apiVersion}/orders.json?status=any`,
//       {
//         headers: {
//           'X-Shopify-Access-Token': accessToken,
//         },
//       }
//     );

//     const orders = ordersResponse.data.orders;
//     console.log('Orders:', orders);
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//   }
// };

const Orders = async (session) => {
  try {
    const accessToken = session.accessToken;
    const apiVersion = "2023-07"; // Use the desired API version
    const response = await axios.get(
      `https://${session.shop}/admin/api/${apiVersion}/orders.json?status=any`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );
    const orders = response.data.orders;
    // console.log("session", session);
    // console.log("All Orders:", orders);
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

// to get all products from portal
const ProductList = async (session) => {
  try {
    console.log("inside product list");
    const accessToken = session.accessToken;
    const apiVersion = "2023-07";
    const response = await axios.get(
      `https://${session.shop}/admin/api/${apiVersion}/products.json?fields=id,images,title,product_type`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );
    console.log("get api response : ", response.data);
    const portalProduct = response.data.products.map((product) => {
      return {
        id: product.id,
        title: product.title,
        category: product.product_type
      };
    });
    // console.log("portalProduct : ", portalProduct);
    return portalProduct;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export default shopify;
export const apiVersion = LATEST_API_VERSION;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
