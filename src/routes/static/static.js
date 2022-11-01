//===========================================================================
//  
//===========================================================================
const express = require('express');
const path = require('path');

const PATH_PUBLIC_DIRECTORY = path.join(__dirname, '../../../public');
const router = express.Router();

const _send_index_html = (req, res) => {
  res.sendFile(path.join(PATH_PUBLIC_DIRECTORY, '/index.html'));
};

router.use(express.static(PATH_PUBLIC_DIRECTORY));
router.get('*', _send_index_html);

module.exports = router;
//===========================================================================