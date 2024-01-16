import { apiVersion, authenticate } from "../shopify.server";
import db from "../db.server";
import axios from "axios";

export const action = async ({ request }) => {
  const { topic, shop, session } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }
  console.log("uninstall clickedd....", session);
  // await removeCustomCode(session);


  throw new Response();
};

const removeCustomCode = async (session) => {
  try {
    const accessToken = session.accessToken;
    const themeId = "131513811134";
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

    console.log("existingContentProductFile", existingContentProductFile);

    // Check if the existing element to be removed from the file
    const textToRemove = '<quidget-element partnerId=\'339ff0a4-3811-4b93-8911-5509945d1f23\' productHandle=\'The Alpha\' productCategory=\'WOMEN\'> </quidget-element>';
    if (existingContentProductFile.includes(textToRemove)) {
      // Remove the element from existingContentProductFile
      existingContentProductFile = existingContentProductFile.replace(textToRemove, '');
    }

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

    console.log("Custom code removed successfully before Add to Cart button");
  } catch (error) {
    console.error("Error removing custom code:", error);
  }
};
