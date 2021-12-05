import { Box, Toolbar, Typography } from '@mui/material';

const Dashboard = (props: any) => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      <Typography paragraph>DASHBOARD</Typography>
    </Box>
  );
};

export default Dashboard;
