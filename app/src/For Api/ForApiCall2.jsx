import React from "react";

const updateTheme = async () => {
    const themeId = '131513811134'; // Replace this with the actual theme ID
    const apiEndpoint = `/admin/api/2023-07/themes/${themeId}.json`;
  
    const payload = {
      theme: {
        // Include the properties you want to update in the theme
        // For example, you can update "name", "src", "role", etc.
      },
    };
  
    try {
      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': 'atkn_ce817dcd31c4167aee6c83350e07cd9732621015f8cc2e5da2cccf2bac18eb7e', // Replace with your actual access token
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        console.log('Theme updated successfully');
      } else {
        console.log('Failed to update the theme');
      }
    } catch (error) {
      console.error('Error updating the theme:', error);
      // Handle any errors that occur during the API call
    }
  };
