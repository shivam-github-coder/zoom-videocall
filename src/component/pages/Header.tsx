import { Box, Button, Drawer, Grid, IconButton, Menu, MenuItem, Typography } from '@material-ui/core';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import Header_logo from '../../assets/header_logo.png';

import Header_icon from '../../assets/app_image.png';
import './index.scss';
import { useHistory, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import LogoutIcon from '@mui/icons-material/Logout';
// import { supabase } from "../../Api";
import MenuIcon from '@mui/icons-material/Menu';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function Header() {
  const history = useHistory();
  const path = useLocation();
  const [LoginOrNot, setLoginOrNot] = useState(false);

  const [openDrawer, setopenDrawer] = useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    if (LoginOrNot) {
      setAnchorEl(event.currentTarget);
    } else {
      history.push('/Loginoption');
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { enqueueSnackbar } = useSnackbar();

  const handleClickVariant = (variant: any) => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar('Logout successfully', { variant });
  };

  const Loggedout = async () => {
    localStorage.removeItem('accessToken');
    setLoginOrNot(false);
    setopenDrawer(false);
    setAnchorEl(null);
    // await supabase.auth.signOut();
    handleClickVariant('success');
  };

  // useEffect(() => {
  //   const user = supabase.auth.user();
  //   if (user) {
  //     setLoginOrNot(true);
  //   } else {
  //     supabase.auth.signOut();
  //     setLoginOrNot(false);
  //   }
  // });

  return (
    <Grid container item className="align-items-center py-2 px-5">
      <Grid item={true} xs={6} md={6} className="d-flex justify-items-start">
        <img src={Header_logo} className="Header_logo" alt="Header_logo" />
      </Grid>
      <Grid item={true} xs={6} md={6} className="d-flex justify-content-end">
        <Box className="align-items-center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <Typography className="pr-4">
            {moment().format('LT')} <span className="px-1">&#8226;</span>
            {moment().format('ddd, MMM DD')}
          </Typography>
          {/* <Button
            variant="outlined"
            style={{ textTransform: "inherit", color: "#949494",display: path.pathname == "/" ? "" : "none" }}
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            // onClick={() =>
            //   accessToken ? Loggedout() : history.push("/Loginoption")
            // }
            onClick={handleClick}
            startIcon={
              <img
                src={Header_icon}
                style={{ width: "20px" }}
                alt="Header_logo"
              />
            }
          >
            <span className={LoginOrNot ? "text-capitalize" : ""}>
              {LoginOrNot ? `Logged In` : "Login to view insight"}
            </span>
          </Button> */}

          {/* <Button
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
          >
            Dashboard
          </Button> */}
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            style={{ marginTop: '2.5em' }}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}
          >
            {/* <MenuItem onClick={handleClose}>Logout</MenuItem> */}
            <MenuItem className="mx-1" onClick={Loggedout} disableRipple>
              <LogoutIcon style={{ marginRight: '10px', fontSize: '20px' }} />
              <span style={{ fontSize: '.9rem' }}>Logout</span>
            </MenuItem>
          </Menu>
        </Box>
        {/* <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <IconButton onClick={() => setopenDrawer(!openDrawer)}>
            <MenuIcon fontSize="large" style={{ cursor: 'pointer' }} />
          </IconButton>
        </Box> */}
      </Grid>
      <Drawer anchor="right" open={openDrawer}>
        <Box sx={{ width: 250 }} className="d-flex flex-column align-items-start h-100">
          <IconButton onClick={() => setopenDrawer(!openDrawer)}>
            <ArrowForwardIosIcon fontSize="small" style={{ cursor: 'pointer' }} />
          </IconButton>
          <Box className="w-100" style={{ flex: 1 }}>
            <Typography className="text-center py-2 mt-2" style={{ backgroundColor: '#494CE2', color: '#fff' }}>
              {moment().format('LT')} <span className="px-1">&#8226;</span>
              {moment().format('dddd, MMMM DD')}
            </Typography>
            <img src={Header_logo} className="Header_logo my-2" alt="Header_logo" />
          </Box>
          <Box
            className={`w-100 my-2 px-3 py-2 d-flex align-items-center ${LoginOrNot && 'bg-danger'} text-white`}
            style={{
              cursor: 'pointer',
              backgroundColor: !LoginOrNot ? '#494CE2' : '',
              color: '#fff'
            }}
            onClick={LoginOrNot ? Loggedout : handleClick}
          >
            {LoginOrNot ? (
              <>
                <LogoutIcon style={{ marginRight: '10px', fontSize: '20px' }} />
                <span style={{ fontSize: '1.2rem' }}>Logout</span>
              </>
            ) : (
              <>
                <AccountCircleIcon style={{ marginRight: '10px', fontSize: '25px' }} />
                <span style={{ fontSize: '1.2rem' }}>Login</span>
              </>
            )}
          </Box>
        </Box>
      </Drawer>
    </Grid>
  );
}

export default Header;
