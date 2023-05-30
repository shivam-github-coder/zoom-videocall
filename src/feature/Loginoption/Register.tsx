import { Box, Button, Grid, IconButton, InputAdornment, TextField, Typography } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Apis, baseURL } from '../../Api';

import HeaderIcon from '../../assets/app_image.png';

function RegisterPage(props: any) {
  const history = useHistory();
  const [SendingEmail, setSendingEmail] = useState(false);
  const [RegisterData, setRegisterData] = useState({
    email: '',
    Fname: '',
    Lname: '',
    date: '',
    pword: 'playground@12345',
    cpword: '',
    invitecode: ''
  });

  const inputFormData = (e: any) => {
    if (e.target.name === 'email') {
      setemailValidate(false);
    } else if (e.target.name === 'Fname') {
      setFnameValid(false);
    } else if (e.target.name === 'Lname') {
      setLnameValid(false);
    } else if (e.target.name === 'date') {
      setDateValid(false);
    } else if (e.target.name === 'pword') {
      setpasswordValidation(false);
    }
    if (e.target.name === 'date') {
      if (moment(e.target.value).isAfter(moment().endOf('day'))) {
        enqueueSnackbar(`Cannot select the future Date`, { variant: 'error' });
        setDateValid(true);
      } else {
        setRegisterData({ ...RegisterData, [e.target.name]: e.target.value });
      }
    } else {
      setRegisterData({ ...RegisterData, [e.target.name]: e.target.value });
    }
  };

  const { enqueueSnackbar } = useSnackbar();

  const handleClickVariant = (variant: any) => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar('Register Success', { variant });
  };

  const [emailValidate, setemailValidate] = useState(false);
  const [FnameValid, setFnameValid] = useState(false);
  const [LnameValid, setLnameValid] = useState(false);
  const [DateValid, setDateValid] = useState(false);
  const [passwordValidation, setpasswordValidation] = useState(false);
  const [SendRegister, setSendRegister] = useState(false);

  // const RegisterForm = async () => {
  //   var letterNumber = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
  //   const a = moment([moment(RegisterData.date).format("YYYY,MM,DD")]);
  //   const b = moment([moment().format("YYYY,MM,DD")]);
  //   setSendRegister(true);
  //   if (
  //     /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
  //       RegisterData.email
  //     ) &&
  //     RegisterData.Fname?.length > 0 &&
  //     RegisterData.Fname.trim()?.length > 0 &&
  //     RegisterData.Lname.trim()?.length > 0 &&
  //     b.diff(a, "year") > 5 &&
  //     RegisterData.pword.match(letterNumber)
  //   ) {
  //     const info = {
  //       fullName: `${RegisterData.Fname + " " + RegisterData.Lname}`,
  //       email: RegisterData.email,
  //       password: RegisterData.pword,
  //       dob: RegisterData.date,
  //     };
  //     await axios
  //       .post(Apis.Register, { ...info })
  //       .then(async function (response) {
  //         if (response.data.data) {
  //           const user = await supabase.auth.signUp(
  //             {
  //               email: RegisterData.email,
  //               password: RegisterData.pword,
  //             },
  //             {
  //               redirectTo: window.location.origin,
  //               data: {
  //                 fullname: RegisterData.Fname + " " + RegisterData.Lname,
  //                 Dob: RegisterData.date,
  //               },
  //             }
  //           );
  //           if (!user.error?.message) {
  //             setSendingEmail(true);
  //             enqueueSnackbar(`Email Sended`, { variant: "success" });
  //             setRegisterData({
  //               email: "",
  //               Fname: "",
  //               Lname: "",
  //               date: "",
  //               pword: "",
  //               cpword: "",
  //               invitecode: "",
  //             });
  //           } else {
  //             enqueueSnackbar(`${user.error?.message}`, { variant: "info" });
  //           }

  //           setSendRegister(false);
  //         } else {
  //           enqueueSnackbar(`${response.data.message}`, { variant: "error" });
  //           setSendRegister(false);
  //         }
  //       })
  //       .catch(function (error) {
  //         console.log(error);
  //       });
  //   }
  //   if (
  //     !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(RegisterData.email)
  //   ) {
  //     setemailValidate(true);
  //     setSendRegister(false);
  //   }
  //   if (RegisterData.Fname?.length == 0) {
  //     setFnameValid(true);
  //     setSendRegister(false);
  //   }
  //   if (RegisterData.Lname?.length == 0) {
  //     setLnameValid(true);
  //     setSendRegister(false);
  //   }
  //   if (!RegisterData.date || b.diff(a, "year") <= 5) {
  //     setDateValid(true);
  //     setSendRegister(false);
  //     enqueueSnackbar(`Enter Age greater then 5 Year`, { variant: "info" });
  //   }
  //   if (!RegisterData.pword.match(letterNumber)) {
  //     setpasswordValidation(true);
  //     setSendRegister(false);
  //   }
  // };

  const [PassShowHide, setPassShowHide] = useState(false);

  return (
    <Grid className="d-flex flex-column  justify-content-center align-items-center px-4">
      <Grid item xs={12} sm={12} md={4}>
        <Grid item={true} xs={12} className="h-100">
          <img src={HeaderIcon} alt="header_logo" style={{ width: '10rem' }} />
          <Typography
            className="pb-3"
            style={{
              fontSize: '36.54px',
              fontWeight: 550,
              lineHeight: '43.3px',
              color: '#434343'
            }}
          >
            Playground
          </Typography>
        </Grid>
        {!SendingEmail ? (
          <>
            <Grid item={true} xs={12} className="pb-2">
              <TextField
                id="filled-search"
                label="Email"
                type="email"
                className="w-100"
                variant="outlined"
                size="small"
                name="email"
                value={RegisterData.email}
                onChange={inputFormData}
                error={emailValidate ? true : false}
              />
            </Grid>
            <Grid container item className=" pb-2">
              <Grid item={true} xs={6} className="pr-1">
                <TextField
                  id="filled-search"
                  label="First Name"
                  type="string"
                  className="w-100"
                  variant="outlined"
                  size="small"
                  name="Fname"
                  value={RegisterData.Fname}
                  autoComplete="off"
                  onChange={inputFormData}
                  error={FnameValid ? true : false}
                />
              </Grid>
              <Grid item={true} xs={6} className="pl-1">
                <TextField
                  id="filled-search"
                  label="Last Name"
                  type="string"
                  className="w-100"
                  variant="outlined"
                  size="small"
                  name="Lname"
                  value={RegisterData.Lname}
                  autoComplete="off"
                  onChange={inputFormData}
                  error={LnameValid ? true : false}
                />
              </Grid>
            </Grid>
            <Grid item={true} xs={12} className="pb-2">
              <TextField
                id="filled-search"
                // label="Email"
                type="date"
                className="w-100"
                variant="outlined"
                size="small"
                name="date"
                value={RegisterData.date}
                autoComplete="off"
                onChange={inputFormData}
                error={DateValid ? true : false}
              />
            </Grid>
            <Box className="mt-3">
              <Button
                disabled={SendRegister}
                variant="contained"
                size="small"
                className="w-20"
                //  onClick={RegisterForm}
              >
                <span className="text-capitalize text-sm">Send Email</span>
              </Button>
            </Box>
          </>
        ) : (
          <>
            <img src="https://c.tenor.com/0ceXa2Dg8ywAAAAC/email-sent.gif" height={200} />
          </>
        )}
      </Grid>
    </Grid>
  );
}

export default RegisterPage;
