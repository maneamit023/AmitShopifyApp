import { Card, FormControl } from '@mui/material'
import { LegacyCard, Text } from '@shopify/polaris'
import React from 'react'

const Support = () => {
    return (
        <>
            <LegacyCard>
                <FormControl>
                    <Text variant="headingXl" as='h3' color="critical">
                        We're sorry to hear that you've encountered an issue.
                    </Text>
                    <Text variant="headingLg" as="h5" color="critical">
                        Please hold on our team working towards a solution.<br />
                        Thank you for your time!
                    </Text>
                </FormControl>  
            </LegacyCard>
        </>
    )
}

export default Support