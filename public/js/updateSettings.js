/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
//type is either password or data
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassWord'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data, // === data:data === data:{name,email} or data: { passwordCurrent, password, passwordConfirm }
    });
    //res is obj has the token and user data except password like in login function user
    // folder name pic 3

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} Updated successfully!`);
    }
    //console.log(res);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
