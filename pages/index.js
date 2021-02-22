import React from 'react';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import { Planner } from "../src/Planner";

export default function Index() {
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Planner />
      </Box>
    </Container>
  );
}
