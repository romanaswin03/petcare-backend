const express = require('express');
const Appointment = require('../models/Appointment');
//const auth = require('../middleware/auth');
const router = express.Router();
const User = require('../models/User');

// Book appointment
router.post('/', async (req, res) => {
  const { petOwnerId, doctorId, date } = req.body;
  try {
    const appointment = new Appointment({ petOwnerId, doctorId, date });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Doctors list
// GET /api/appointments/doctor
router.get('/doctors', async(req, res) => {
    try{
        const doctors = await User.find({role: 'doctor'}).select('name _id');
        res.json(doctors);
    }catch(error){
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch doctos' });
    }
});

// Get appointments for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId })
      .populate('petOwnerId', 'name email')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all appointments
router.get('/all', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('petOwnerId', 'name')
      .populate('doctorId', 'name')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('petOwnerId', 'name').populate('doctorId', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (err) {
  console.error('Error updating appointment status:', err); // Show full error in terminal
  res.status(500).json({ message: 'Server error', error: err.message }); // Include error in response
}
});

//Book Appointment
router.post('/book', async (req, res) => {
    try{
        const { doctorId, date, petOwnerId} = req.body;
        console.log('Booking request:',{doctorId, date});
        
        console.log('Incoming data:', {doctorId, date});
        console.log('Authenticated user ID:', petOwnerId);
        if(!doctorId || !date || !petOwnerId){
            return res.status(400).json({
                message: 'doctorId, petOwnerId and date are required'
            });
        }

        const newAppointment = new Appointment({
            doctorId,
            petOwnerId,
            date,
            status: 'pending',
        });

        await newAppointment.save();

        res.status(201).json({ message: 'Appointment booked successfully!'});
    } catch(error){
        console.error('Booking error: ', error);
        res.status(500).json({message: 'Server error' });
    }
 });

 router.get('/doctors', (req, res) => {
  console.log('Headers: ', req.headers);
  
 })

module.exports = router;