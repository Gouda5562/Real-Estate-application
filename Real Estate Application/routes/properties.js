const express = require('express');
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  likeProperty,
  interestProperty
} = require('../controllers/propertyController');

const router = express.Router();

router.route('/')
  .post(createProperty)
  .get(getProperties);

router.route('/:id')
  .get(getProperty)
  .put(updateProperty)
  .delete(deleteProperty);

router.put('/:id/like', likeProperty);
router.post('/:id/interest', interestProperty);

module.exports = router;
