/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    //n summary, this code uses the axios library to make a POST request to a specified login endpoint with the provided email and password data. The response from the server is stored in the res variable, allowing you to handle the server's response and process it as needed.
    //here like we login in users and save jwt in brwoser
    // here whte mater is just we made jwt an stored in browser
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    //res is obj has the token and user data except password like in login function user
    // folder name pic 3

    if (res.data.status === 'success') {
      showAlert('success', 'Loged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    //console.log(res);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });
    if (res.data.status === 'success') location.reload(true);
    // location.reload(true) will force relode from server not from browser cash, fresh page coming from server we can put  location.assign('/');
  } catch (err) {
    showAlert('error', 'Error logging out! try again');
  }
};
