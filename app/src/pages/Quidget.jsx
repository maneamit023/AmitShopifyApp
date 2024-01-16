import { Button, ButtonGroup, Frame, LegacyStack, Loading, Modal, RadioButton, Text } from '@shopify/polaris';
import axios from 'axios';
import React, { useCallback, useState } from 'react'
import { useRadioGroup } from '@mui/material/RadioGroup';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';

export default function Quidget() {
  const [value, setValue] = useState('Below');
  // const [isModalOpen, setModalOpen] = useState(false);

  // const handleOpenModal = (event) => {
  //   setModalOpen(true);
  //   console.log("open modal",event);
  //   handleSave(event);
  // };

  // const handleCloseModal = () => {
  //   setModalOpen(false);
  // };

  // const handleSave = (event) => {
  //   // Add your save logic here
  //   console.log("save clicked :", event);
  //   setValue(event)
  //   if (event == 'Above') {
  //     addAbove()
  //   } else {
  //     addBelow()
  //   }
  //   handleCloseModal();
  // };

  const addAbove = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/aboveAddToCart');
      // setApiData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addBelow = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/belowAddToCart');
      // setApiDataq(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (event) => {
    console.log(event.target.value);
    setValue(event.target.value);
    // handleSave(event.target.value);
    // handleOpenModal(event.target.value);
  };

  return (
    <>
      <LegacyStack vertical>
        <FormControl>
          <Text variant="headingXl" as="h4" color="success" fontWeight="bold">
            Please select the position of FIND MY FIT button.
          </Text>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={value}
            onClick={handleChange}
            // onChange={(newValue) => {
            //   setValue(value);
            //   handleChange(newValue);
            // }}
          >
            <FormControlLabel value="Above" onClick={addAbove} control={<Radio />} label="Above Add to Cart button" />
            <FormControlLabel value="Below" onClick={addBelow} control={<Radio />} label="Below Add to Cart button" />
          </RadioGroup>
        </FormControl>
      </LegacyStack>

      {/* <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title="Confirmation"
        primaryAction={{
          content: 'Save',
          onAction: handleSave,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleCloseModal,
          },
        ]}
      >
        <Modal.Section>
          <Text as='span' color='success'>Are you sure you want to save the selected position?</Text>
        </Modal.Section>
      </Modal> */}
    </>
  );
}