import React from 'react'
import FreeTrialCompo from '../components/FreeTrialCompo'
import { Button, Card } from '@mui/material'

const FreeTrial = () => {
    return (
        <>
            <Card>
                <Button variant="contained">Start your 14 days free trial</Button>
            </Card>
                <FreeTrialCompo />
        </>
    )
}

export default FreeTrial