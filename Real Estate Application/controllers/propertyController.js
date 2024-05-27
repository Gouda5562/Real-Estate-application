const Property = require('../models/Property');
const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.createProperty = async (req, res) => {
  const { title, description, location, area, bedrooms, bathrooms, nearby, price } = req.body;
  const seller = req.user.id;

  try {
    const property = new Property({
      title,
      description,
      location,
      area,
      bedrooms,
      bathrooms,
      nearby,
      price,
      seller
    });

    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('seller', 'firstName lastName email phone');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('seller', 'firstName lastName email phone');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    for (let key in updates) {
      property[key] = updates[key];
    }

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await property.remove();
    res.json({ message: 'Property removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.likeProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.likes += 1;
    await property.save();
    res.json({ likes: property.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.interestProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('seller', 'firstName lastName email phone');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const buyer = await User.findById(req.user.id);
    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }

    // Send email to seller
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: property.seller.email,
      subject: 'New Interested Buyer',
      text: `You have a new interested buyer for your property: ${property.title}.\n\nBuyer Details:\nName: ${buyer.firstName} ${buyer.lastName}\nEmail: ${buyer.email}\nPhone: ${buyer.phone}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: error.message });
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    // Send email to buyer
    const buyerMailOptions = {
      from: process.env.EMAIL,
      to: buyer.email,
      subject: 'Property Interest Confirmation',
      text: `You have shown interest in the property: ${property.title}.\n\nSeller Details:\nName: ${property.seller.firstName} ${property.seller.lastName}\nEmail: ${property.seller.email}\nPhone: ${property.seller.phone}`
    };

    transporter.sendMail(buyerMailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: error.message });
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.json({ message: 'Interest email sent to seller and buyer' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
