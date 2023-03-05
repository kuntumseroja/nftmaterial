import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Grid,
  TextField,
  Typography,
  IconButton,
  Collapse,
  Alert,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import DialogBox from 'components/DialogBox';

import web3 from 'web3';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import Material from 'contracts/Material.sol/Material.json';

const validationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Name too short')
    .max(50, 'Name too long')
    .required('Please specify the name'),
  description: yup
    .string()
    .trim()
    .max(1000, 'Should be less than 1000 chars')
    .required('Please write description'),
  mtdomain: yup
    .string()
    .trim()
    .max(1000, 'Should be less than 100 chars')
    .required('Please write description'),  
  mtgroup: yup
    .string()
    .trim()
    .max(1000, 'Should be less than 100 chars')
    .required('Please write description'),  
  mtclass1: yup
    .string()
    .trim()
    .max(1000, 'Should be less than 1000 chars')
    .required('Please write description'),  
  mtclass2: yup
    .string()
    .trim()
    .max(1000, 'Should be less than 1000 chars')
    .required('Please write description'),  
  mtclass3: yup
    .string()
    .trim()
    .max(1000, 'Should be less than 1000 chars')
    .required('Please write description'),  
  mtclass4: yup
    .string()
    .trim()
    .max(1000, 'Should be less than 1000 chars')
    .required('Please write description'),  
  mtclass5: yup
    .string()
    .trim()
    .max(1000, 'Should be less than 1000 chars')
    .required('Please write description'),  
  mtclass6: yup
    .string()
    .trim()
    .max(1000, 'Should be less than 1000 chars')
    .required('Please write description'),
  price: yup
    .string()
    .min(0, 'Price should be minimum 0')
    .required('Please specify NFT price'),
  address: yup
    .string()
    .min(0, 'Price should be minimum 3')
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      'Enter correct url!',
    ),
});

const Form = () => {
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      mtdomain: '',
      mtgroup: '',
      mtclass1: '',
      mtclass2: '',
      mtclass3: '',
      mtclass4: '',
      mtclass5: '',
      mtclass6: '',
      price: '',
      address: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setLoading(true);
      createMarket();
    },
  });

  const [open, setOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [loading, setLoading] = React.useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [dialogBoxOpen, setDialogBoxOpen] = useState(false);
  const [hash, setHash] = useState('');
  const fileInputRef = useRef(null);

  const projectId = process.env.INFURA_IPFS_ID;
  const projectSecret = process.env.INFURA_IPFS_SECRET;
  const infuraDomain = process.env.INFURA_IPFS_DOMAIN;

  const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

  const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });

  async function createSale(url) {
    if (fileUrl) {
      const web3Modal = new Web3Modal({
        network: 'mainnet',
        cacheProvider: true,
      });
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const price = web3.utils.toWei(formik.values.price, 'ether');
      let contract = new ethers.Contract(
        process.env.MARKETPLACE_ADDRESS,
        Material.abi,
        signer,
      );
      let listingPrice = await contract.getListingPrice();
      listingPrice = listingPrice.toString();
      let transaction = await contract.createToken(url, price, {
        value: listingPrice,
      });

      try {
        await transaction.wait();
        setHash(transaction.hash);
        setDialogBoxOpen(true);
      } catch (error) {
        alert('Error in creating NFT! Please try again.');
        setLoading(false);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // clear the file input
      }
      setAlertOpen(false);
      formik.resetForm();
      console.log(fileUrl);
      setLoading(false);
    }

    if (!fileUrl) return setAlertOpen(true);
  }

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `${infuraDomain}/ipfs/${added.path}`; //DEDICATED SUBDOMAIN FROM INFURA
      setFileUrl(url);
      console.log(url);
      setOpen(true);
    } catch (error) {
      console.log('Error uploading file: ', error);
      setLoading(false);
      setOpen(false);
    }
  }

  async function createMarket() {
    const { name, description, mtdomain, mtgroup, mtclass1, mtclass2, mtclass3, mtclass4, mtclass5, mtclass6, price, address } = formik.values;
    if (!name || !description || !mtdomain || !mtgroup || !mtclass1 || !mtclass2 || !mtclass3 || !mtclass4 || !mtclass5 || !mtclass6 || !price || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      mtdomain,
      mtgroup,
      mtclass1,
      mtclass2,
      mtclass3,
      mtclass4,
      mtclass5,
      mtclass6,
      address,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `${infuraDomain}/ipfs/${added.path}`;
      createSale(url);
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  }

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Typography
              variant={'subtitle2'}
              sx={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}
              fontWeight={700}
            >
              <AttachFileIcon fontSize="medium" />
              Upload file *
            </Typography>
            <input
              type="file"
              name={'file'}
              onChange={onChange}
              ref={fileInputRef}
            />
            <Collapse in={open}>
              <Alert
                severity="success"
                sx={{ mt: 1 }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                File uploaded successfully!
              </Alert>
            </Collapse>
            <Box sx={{ width: '100%' }}>
              <Collapse in={alertOpen}>
                <Alert
                  severity="error"
                  action={
                    <IconButton
                      aria-label="close"
                      color="inherit"
                      size="small"
                      onClick={() => {
                        setAlertOpen(false);
                      }}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  }
                  sx={{ mb: 2 }}
                >
                  Please upload a file!
                </Alert>
              </Collapse>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant={'subtitle2'}
              sx={{ marginBottom: 2 }}
              fontWeight={700}
            >
              Material Data NFT Name
            </Typography>
            <TextField
              label="Name of your NFT *"
              variant="outlined"
              name={'name'}
              fullWidth
              onChange={formik.handleChange}
              value={formik.values?.name}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant={'subtitle2'}
              sx={{ marginBottom: 2 }}
              fontWeight={700}
            >
              Description
            </Typography>
            <TextField
              label="Description *"
              variant="outlined"
              name={'description'}
              multiline
              rows={3}
              fullWidth
              onChange={formik.handleChange}
              value={formik.values?.description}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={
                formik.touched.description && formik.errors.description
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography
              variant={'subtitle2'}
              sx={{ marginBottom: 2 }}
              fontWeight={700}
            >
              Material Domain
            </Typography>
            <TextField
              label="Phase at room temperature for majority of materials in group"
              variant="outlined"
              name={'mtdomain'}
              fullWidth
              onChange={formik.handleChange}
              value={formik.values?.mtdomain}
              error={formik.touched.mtdomain && Boolean(formik.errors.mtdomain)}
              helperText={formik.touched.mtdomain && formik.errors.mtdomain}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant={'subtitle2'}
              sx={{ marginBottom: 2 }}
              fontWeight={700}
            >
              Material Group
            </Typography>
            <TextField
              label="Group of periodic table to which element of simple substance belongs"
              variant="outlined"
              name={'mtgroup'}
              fullWidth
              onChange={formik.handleChange}
              value={formik.values?.mtgroup}
              error={formik.touched.mtgroup && Boolean(formik.errors.mtgroup)}
              helperText={formik.touched.mtgroup && formik.errors.mtgroup}
            />
          </Grid> 
{/* //end row3  */}
{/* //start row 4 */}
            <Grid item xs={12} sm={6}>
            <Typography
              variant={'subtitle2'}
              sx={{ marginBottom: 2 }}
              fontWeight={700}
            >
              Material Class 1
            </Typography>
            <TextField
              label="Name of material group having similar material character and similar behavior of properties"
              variant="outlined"
              name={'mtclass1'}
              fullWidth
              onChange={formik.handleChange}
              value={formik.values?.mtclass1}
              error={formik.touched.mtclass1 && Boolean(formik.errors.mtclass1)}
              helperText={formik.touched.mtclass1 && formik.errors.mtclass1}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant={'subtitle2'}
              sx={{ marginBottom: 2 }}
              fontWeight={700}
            >
              Material Class 2
            </Typography>
            <TextField
              label="Substance name, Chemical formula, CAS registry number, IUPAC Name"
              variant="outlined"
              name={'mtclass2'}
              fullWidth
              onChange={formik.handleChange}
              value={formik.values?.mtclass2}
              error={formik.touched.mtclass2 && Boolean(formik.errors.mtclass2)}
              helperText={formik.touched.mtclass2 && formik.errors.mtclass2}
            />
          </Grid> 
{/* //end row 4 */}
{/* //start row 5 */}
            <Grid item xs={12} sm={6}>
            <Typography
              variant={'subtitle2'}
              sx={{ marginBottom: 2 }}
              fontWeight={700}
            >
              Material Class 3
            </Typography>
            <TextField
              label="Material name, crystal structure, phase, application field, form"
              variant="outlined"
              name={'mtclass3'}
              fullWidth
              onChange={formik.handleChange}
              value={formik.values?.mtclass3}
              error={formik.touched.mtclass3 && Boolean(formik.errors.mtclass3)}
              helperText={formik.touched.mtclass3 && formik.errors.mtclass3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant={'subtitle2'}
              sx={{ marginBottom: 2 }}
              fontWeight={700}
            >
              Material Class 4
            </Typography>
            <TextField
              label="Grade of commercial material, Material standard, chemical composition, RM/CRM code, main material manufacturing process such as equipment"
              variant="outlined"
              name={'mtclass4'}
              fullWidth
              onChange={formik.handleChange}
              value={formik.values?.mtclass4}
              error={formik.touched.mtclass4 && Boolean(formik.errors.mtclass4)}
              helperText={formik.touched.mtclass4 && formik.errors.mtclass4}
            />
          </Grid> 
{/* //end row 5
//start row 6 */}
<Grid item xs={12} sm={6}>
            <Typography
              variant={'subtitle2'}
              sx={{ marginBottom: 2 }}
              fontWeight={700}
            >
              Material Class 5
            </Typography>
            <TextField
              label="Lot name, information related to fine material manufacturing process such as pre- and post -processes"
              variant="outlined"
              name={'mtclass5'}
              fullWidth
              onChange={formik.handleChange}
              value={formik.values?.mtclass5}
              error={formik.touched.mtclass5 && Boolean(formik.errors.mtclass5)}
              helperText={formik.touched.mtclass5 && formik.errors.mtclass5}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant={'subtitle2'}
              sx={{ marginBottom: 2 }}
              fontWeight={700}
            >
              Material Class 6
            </Typography>
            <TextField
              label="Specimen name, specimen shape and size"
              variant="outlined"
              name={'mtclass6'}
              fullWidth
              onChange={formik.handleChange}
              value={formik.values?.mtclass6}
              error={formik.touched.mtclass6 && Boolean(formik.errors.mtclass6)}
              helperText={formik.touched.mtclass6 && formik.errors.mtclass6}
            />
          </Grid> 
{/* //end row 6 */}

          <Grid item xs={12} sm={6}>
            <Typography
              variant={'subtitle2'}
              sx={{ marginBottom: 2 }}
              fontWeight={700}
            >
              Price
            </Typography>
            <TextField
              label="Price in Matic *"
              variant="outlined"
              name={'price'}
              fullWidth
              onChange={formik.handleChange}
              value={formik.values?.price}
              error={formik.touched.price && Boolean(formik.errors.price)}
              helperText={formik.touched.price && formik.errors.price}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant={'subtitle2'}
              sx={{ marginBottom: 2 }}
              fontWeight={700}
            >
              Link
            </Typography>
            <TextField
              label="Link to your NFT"
              variant="outlined"
              name={'address'}
              fullWidth
              onChange={formik.handleChange}
              value={formik.values?.address}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
            />
          </Grid>



          <Grid item container xs={12}>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretched', sm: 'center' }}
              justifyContent={'space-between'}
              width={1}
              margin={'0 auto'}
            >
              <LoadingButton
                endIcon={<SendIcon />}
                size={'large'}
                variant={'contained'}
                type={'submit'}
                loading={loading}
                loadingPosition={'end'}
              >
                Create
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
      </form>
      <DialogBox
        open={dialogBoxOpen}
        onClose={() => setDialogBoxOpen(false)}
        title={'Yeee!'}
        message={`NFT created successfully with hash: ${hash}`}
        buttonText="View on polygonscan"
        buttonLink={`https://mumbai.polygonscan.com/tx/${hash}`}
      />
    </Box>
  );
};

export default Form;
