const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.send('API works!')
})

router.post('/newType', (req, res) => {
  console.log(req.body)
  res.json({
    status: 200,
    message: "Entry added successfully",
    body: { }
  });
})

module.exports = router;
