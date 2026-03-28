const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('image', fs.createReadStream('test.jpeg')); // replace with your image path

axios.post('http://localhost:5000/api/v1/upload/test', form, {
  headers: form.getHeaders(),
})
.then(res => console.log('Success:', res.data))
.catch(err => console.error('Error:', err.response?.data || err.message));