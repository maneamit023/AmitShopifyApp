// @ts-ignore
import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material'
import axios from 'axios';
import { useEffect, useState } from 'react';

const FreeTrialCompo = () => {


  const [allTrial, setAllTrial] = useState([]);
  useEffect(() => {
    // Make API request when the component mounts
    axios.get('http://localhost:3004/api/trialdata')
      .then(response => {
        setAllTrial(response.data)
        console.log("trial res_", response.data);
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <>
      <Button variant="contained">Start your 14 days free trial</Button>
      <div style={{ display: 'flex' }}>
        {allTrial.map(trial => (
          <Card key={trial.
            // @ts-ignore
            id} sx={{ maxWidth: 345, marginBottom: 2 }}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                ${trial.
                  // @ts-ignore
                  price}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {trial.
                  // @ts-ignore
                  description}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">{trial.
                // @ts-ignore
                buttonText}</Button>
            </CardActions>
          </Card>
        ))}
      </div>
    </>
  )
}

export default FreeTrialCompo