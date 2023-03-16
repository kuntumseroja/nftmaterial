import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Paper } from '@mui/material';
import axios from 'axios';
import Papa from 'papaparse';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const CsvViewer = ({ fileUrl }) => {
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (fileUrl) {
        const response = await axios.get(fileUrl);
        const parsedData = Papa.parse(response.data, { delimiter: ";", header: true, skipEmptyLines: true });
        setCsvData(parsedData.data);
      }
    };

    fetchData();
  }, [fileUrl]);

  const headers = csvData.length > 0 ? Object.keys(csvData[0]) : [];

  return (
    <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header, i) => (
              <TableCell key={i}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {csvData.map((row, i) => (
            <TableRow key={i}>
              {headers.map((header, cellIndex) => (
                <TableCell key={cellIndex}>{row[header]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Grid>
    <Grid item xs={12} md={6}>
        <LineChart
          width={500}
          height={300}
          data={csvData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={headers[0]} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={headers[1]} stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </Grid>
    </Grid>
  );
};

export default CsvViewer;
