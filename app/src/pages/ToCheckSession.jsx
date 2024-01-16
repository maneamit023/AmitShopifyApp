
import { authenticate } from "~/shopify.server";
import db from "app/db.server";
import axios from "axios";

export const ToCheckSession = async ({ request }) => {
  const { topic, shop, session } = await authenticate.webhook(request);


  console.log("uninstall clickedd....", session);


  throw new Response();
};