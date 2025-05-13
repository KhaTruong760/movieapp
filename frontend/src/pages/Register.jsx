import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const navLogin = () => {
    navigate('/login');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await authService.register(username, email, password);
      navigate('/login'); // Redirect to login after successful registration
    } catch (err) {
      setError(err.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#678dc6] to-[#E5E5E5]">
    <div  className='grid w-[100%] h-screen place-items-center'>
    <div className=" grid w-[430px] bg-white rounded-lg shadow-lg text-black">
    <div className="flex justify-center mb-4">
      <h2 className=''>Register</h2>
      {error && <div className="error-message">{error}</div>}
      </div>
      
      <form className="space-y-4 p-2" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            className='w-[90%] p-3 border-b-2 border-gray-300 outline-none focus:border-cyan-500 placeholder-gray-400'
            placeholder='Username'
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div >
          <input
            className='w-[90%] p-3 border-b-2 border-gray-300 outline-none focus:border-cyan-500 placeholder-gray-400'
            placeholder='Email'
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="">
          <input
            type="password"
            className='w-[90%] p-3 border-b-2 border-gray-300 outline-none focus:border-cyan-500 placeholder-gray-400'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        </form>
        <br/>
        <div className='flex justify-center mt-4'>
        <button className=' justify-center w-[70%] p-3 bg-blue-300 text-white rounded-full text-lg font-medium hover:opacity-90 transition' type="submit">Register</button>
        </div>
        <div className='flex justify-cente p-3'>
        <p className='text-gray-500'>Already have an account? <button type = 'submit' className='text-blue-500 hover:underline' onClick={navLogin}> Sign in </button> </p>
        </div>
        <br/>
    </div>
    </div>
    </div>
  );
}

export default Register;