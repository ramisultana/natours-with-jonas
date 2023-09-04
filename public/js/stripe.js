/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51NlQ3iKJs7hOOE559SmlpM2oxwmWZKN76fnQXmkVxRPl1fgCil1vnW7kuJKGkogS1MZADoQl5amE00su9Q3D6kCR00ed578s08'
);
export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    //console.log(session);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
