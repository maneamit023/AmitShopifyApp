import { ButtonBase } from '@mui/material';
import { Page, DataTable, Text, Button } from '@shopify/polaris';
import axios from 'axios';
import { useEffect, useState } from 'react';

function ReportTable() {
  const [allUsers, setAllUsers] = useState([]);
  useEffect(() => {
    // Make API request when the component mounts
    axios.get('http://localhost:3004/api/allUsers')
      .then(response => {
        setAllUsers(response.data)
        // console.log("res_", response.data);
      })
      .catch(error => console.error(error));
  }, []);

  const rows = allUsers.map(user => [
    // @ts-ignore
    [`${user.name}`,], [`${user.date}`], [`${(user.ClickRate)}`], [`${user.SKUNumber}`]]);


  const headings = ['Product Name', 'Date', "Average Click's", 'SKU Number'];

  const convertToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      [headings.join(",")].concat(rows.map(row => row.join(","))).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);
    link.click();
  };


  return (
    <>
      <Text variant="headingXl" as="h4" color="success" fontWeight="bold">
        Report's
      </Text>
      <DataTable
        columnContentTypes={[
          'text',
          'text',
          'numeric',
          'numeric',
        ]}
        headings={[
          'Product Name',
          'Date',
          "Average Click's",
          'SKU Number',
        ]}
        rows={rows}
      />

      <Button onClick={convertToCSV} >Save Report</Button>
    </>
  );
}
export default ReportTable;