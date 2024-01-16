import { useCallback, useEffect, useState } from "react";
import { json } from "@remix-run/node";
import axios from "axios";
import shopify from "../shopify.server";
// import ShopifyTheme from '../src/ShopifyThemes';
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  VerticalStack,
  Card,
  Button,
  HorizontalStack,
  Box,
  Divider,
  List,
  Link,
  LegacyStack,
  RadioButton,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import { LegacyCard, Tabs } from '@shopify/polaris';
import Quidget from "../src/pages/Quidget";
import Configuration from "../src/pages/Configuration";
import ReportTable from "~/src/components/ReportTable";
import Support from "~/src/pages/Support";
import FreeTrialCompo from "../src/components/FreeTrialCompo";
import Orders from "../src/pages/Orders";
import Products from "~/src/pages/Products";
import ProductCategory from "~/src/pages/ProductCategory";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop.replace(".myshopify.com", "") });
};

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
          variants: [{ price: Math.random() * 100 }],
        },
      },
    }
  );

  const responseJson = await response.json();

  return json({
    product: responseJson.data.productCreate.product,
  });
}

export default function Index() {
  const nav = useNavigation();
  const { shop } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const productId = actionData?.product?.id.replace(
    "gid://shopify/Product/",
    ""
  );

  useEffect(() => {
    if (productId) {
      // shopify.toast.show("Product created");
    }
  }, [productId]);

  // const generateProduct = () => submit({}, { replace: true, method: "POST" });
  // const test = () => { alert(); console.log("code is working..."); }

  // const [apiData, setApiData] = useState(null);
  // const addAbove = async () => {
  //   try {
  //     const response = await axios.get("http://localhost:3001/api/aboveAddToCart");
  //     setApiData(response.data);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  // const [apiData1, setApiDataq] = useState(null);
  // const addBelow = async () => {
  //   try {
  //     const response = await axios.get("http://localhost:3001/api/belowAddToCart");
  //     setApiDataq(response.data);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  // //graphql api call
  // const fetchGraphQLData = async () => {
  //   try {
  //     const graphqlQuery = `
  //       {
  //         shop {
  //           name
  //           description
  //         }
  //       }
  //     `;
  //     const response = await axios.post(
  //       "http://localhost:3002/graphql", // Update with your GraphQL endpoint
  //       { query: graphqlQuery }
  //     );
  //     setApiData(response.data.data);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  // function RadioButtonExample() {
  //   const [value, setValue] = useState('disabled');

  //   const handleChange = useCallback(
  //     (newValue) => setValue(newValue),
  //     [],
  //   );


  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );

  const tabs = [
    {
      id: 'quidget-position',
      content: 'Quidget Position',
      accessibilityLabel: 'All customers',
      panelID: 'all-customers-content-1',
    },
    {
      id: 'reports',
      content: 'Reports',
      panelID: 'accepts-marketing-content-1',
    },
    {
      id: 'configuration',
      content: 'Configuration',
      panelID: 'repeat-customers-content-1',
    },
    {
      id: 'trial',
      content: 'Free Trial',
      panelID: 'trial user',
    },
    {
      id: 'Support',
      content: 'Support',
      panelID: 'support user',
    },
    {
      id: 'order',
      content: 'Orders',
      panelID: 'orders user',
    },
    {
      id: 'product',
      content: 'Products',
      panelID: 'product user',
    },
    {
      id: 'productCategory',
      content: 'Products Category',
      panelID: 'product Category',
    }
  ];

  return (
    <Page>
      <ui-title-bar title="LAWS OF MOTIONS">

      </ui-title-bar>
      <LegacyCard>
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
          <LegacyCard.Section >
            {/* <p>Tab {selected} selected</p> */}
            {selected === 0 && <Quidget />}
            {selected === 1 && <ReportTable />}
            {selected === 2 && <Configuration />}
            {selected === 3 && <FreeTrialCompo />}
            {selected === 4 && <Support />}
            {selected === 5 && <Orders />}
            {selected === 6 && <Products />}
            {selected === 7 && <ProductCategory />}
          </LegacyCard.Section>
        </Tabs>
      </LegacyCard>
    </Page>
  );
}
// }