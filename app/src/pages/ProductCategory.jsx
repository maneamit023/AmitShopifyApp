// @ts-ignore
import Modal from 'react-modal';
// @ts-ignore
import React, { useEffect, useState } from 'react';
import {
  Button,
  DataTable,
  LegacyCard,
  Page,
  Text,
} from '@shopify/polaris';
import axios from 'axios';
import prisma from '~/db.server';

const ProductsCategory = () => {
  const [category, setCategory] = useState([]);
  const [prodURL, setProdURL] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newURL, setNewURL] = useState(""); // New state to store the updated URL
  const [isTextBoxModalOpen, setIsTextBoxModalOpen] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3004/api/getAllCategoryFromDB');
        setCategory(response.data);
      } catch (error) {
        console.log('Error fetching category:', error);
      }
    };

    fetchData();
  }, []);

  const fetchCategory = async () => {
    try {
      const response = await axios.get('http://localhost:3004/api/getAllCategoryFromDB');
      setCategory(response.data);
    } catch (error) {
      console.log('Error fetching category:', error);
    }
  };
  const fetchSizeChartURL = async () => {
    try {
      const response = await axios.get('http://localhost:3004/api/getSizeChartUrl');
      setProdURL(response.data);
      console.log("URL product : ",response.data);
    } catch (error) {
      console.log('Error fetching category:', error);
    }
  };

  const handleTextBoxModalOpen = () => {
    setIsTextBoxModalOpen(true);
  };

  const handleTextBoxModalClose = () => {
    setNewURL(""); //Clear the newURL state
    setIsTextBoxModalOpen(false);
  };
  
  const updateURL= async (category, newURL) => {
    console.log("-------------");
    try {
      const updatedURL = await prisma.category_sizing.update({
        where: { category: category },
        data: { size_chart_url: newURL },
      });
  
      console.log('Product updated:', updatedURL);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleURLChange = () => {
    // Handle the logic for updating the URL with the newURL state
    alert(`Updating URL to: ${newURL}`);

    updateURL(newURL)

    handleTextBoxModalClose();
  };

  const rows = category.map(pcategory => [
    // @ts-ignore
    // [pcategory.id],
    // @ts-ignore
    [`${pcategory.category}`],
    [ 
      <a
        // @ts-ignore
        href={pcategory.size_chart_url}
        onClick={(e) => {
          e.preventDefault();
          // @ts-ignore
          setSelectedImage(pcategory.size_chart_url);
          setIsModalOpen(true);
        }}
      >
        {pcategory.
      // @ts-ignore
        size_chart_url}
      </a>
     
    ],
    [<Button onClick={handleTextBoxModalOpen}>Change URL</Button>]
  ]);



  return (
    <Page>
      <Text variant="headingXl" as="h4" color="success" fontWeight="bold">
        Products Category
      </Text>

      {/* <Button size='medium' onClick={fetchCategory}>Fetch New Category</Button> */}
      {/* <Button size='medium' onClick={fetchSizeChartURL}>Get Product URL</Button> */}
      <LegacyCard>
        <DataTable
          columnContentTypes={[
            // 'text',
            'text',
            'text',
            'text'
          ]}
          headings={[
            // 'Sr.No',
            'Category',
            'Size Chart',
            'Action'
          ]}
          rows={rows}
        />
      </LegacyCard>

      <Modal
        isOpen={isTextBoxModalOpen}
        onRequestClose={handleTextBoxModalClose}
        contentLabel="URL Change Modal"
      >
        <Text as='h3'>Enter New URL:</Text>
        <input
          type="text"
          value={newURL}
          onChange={(e) => setNewURL(e.target.value)}
        />
        <Button onClick={handleURLChange}>Update URL</Button>
        <Button onClick={handleTextBoxModalClose}>Cancel</Button>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Image Modal"
      >
        {selectedImage && <img src={selectedImage} alt="Selected" />}
        <button onClick={() => setIsModalOpen(false)}>Close Modal</button>
      </Modal>
    </Page>
  );
};

export default ProductsCategory;
