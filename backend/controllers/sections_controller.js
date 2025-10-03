const Section = require('../models/section');

exports.getSections = async (req, res) => {
  try {
    const sections = await Section.findOne()
      .populate('offers')
      .populate('bestOrders')
      .populate('popularCategories');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createSection = async (req, res) => {
  try {
    const newSection = new Section(req.body);  
    await newSection.save();
    res.status(201).json(newSection);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};