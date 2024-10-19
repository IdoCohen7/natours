import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId, price) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/bookings/bookTour/${tourId}`,
      data: {
        price,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Tour booked successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    if (err.response.data.message.startsWith('E11000 ')) {
      showAlert('error', 'You have already booked this tour!');
    } else {
      showAlert('error', err.response.data.message);
    }
  }
};
