import {
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Text,
  Badge,
  useBreakpoints,
  Button,
  Page,
  Layout,
} from '@shopify/polaris';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Products = () => {
  const [product, setProduct] = useState([]);
  const [portalProducts, setPortalProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/getAllProductsFromPortal').then((res) => {
      console.log("get all hit from 3001", res.data);
    }).catch((err) => {
      console.log("error", err);
    })
  }, []);
  
  useEffect(() => {
    axios.get('http://localhost:3004/api/getAllProductFromDB').then((res) => {
      console.log("get all hit from 3004");
      setProduct(res.data);
    }).catch((error) => {
      console.log('Error fetching product:', error);
    })
  }, []);


  // to fetch products from portal after app installation 
  async function fetchProducts() {
    try {
      // to get products from the portal 
      const response = await axios.get('http://localhost:3004/api/getAllProductFromDB');
      const portalResponse = await axios.get('http://localhost:3001/api/getAllProductsFromPortal');
      console.log("get all hit from 3001");
      setProduct(response.data);
      setPortalProducts(portalResponse.data);
      // console.log("products from portal :", portalResponse.data);
    } catch (error) {
      console.log('Error fetching product:', error);
    }
  }
  // console.log("new prodcts :",portalProducts);

  const resourceName = {
    singular: 'products',
    plural: 'products',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(product);

  // if (selectedResources) {
  //    alert("selected");
  // }

  const rowMarkup = product.map((
    { id, pid, title, category },
    index,
  ) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {pid}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {category}
        </Text>
      </IndexTable.Cell>
      {/* <IndexTable.Cell>{date}</IndexTable.Cell> */}

    </IndexTable.Row>
  ),
  );
  console.log("rowMarkup", selectedResources);

  return (
    <Page>
      <Text variant="headingXl" as="h4" color="success" fontWeight="bold">
        Products
      </Text>

      <Button size='medium' onClick={fetchProducts}>Fetch Products</Button>
      <LegacyCard>
        <IndexTable
          condensed={useBreakpoints().smDown}
          resourceName={resourceName}
          itemCount={product.length}
          selectedItemsCount={
            allResourcesSelected ? 'All' : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: 'Product Id' },
            { title: 'Product Name' },
            { title: 'Product Category' },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </LegacyCard>
    </Page>
  )
}

export default Products