// ... (rest of the code)


import { Button, Page } from "@shopify/polaris";

export default function CallFuction() {
  
    const handleUpdateTheme = () => {
      updateTheme(); 
    };
  
    return (
      <Page>
        <Button onClick={handleUpdateTheme}>Update Theme</Button>
      </Page>
    );
  }

function updateTheme() {
  alert("code is running...");
}
  