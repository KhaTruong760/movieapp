import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const navRegister = () => {
    navigate('/register');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await authService.login(username, password);
      navigate('/'); // Redirect to dashboard after login
    } catch (err) {
      setError(err.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#678dc6] to-[#E5E5E5]">
       <div  className='grid w-[100%] h-screen place-items-center'>
          <div className=" grid w-[430px] bg-white rounded-lg shadow-lg text-black">
           <div className="flex justify-center mb-4">
          <h2 className="text-3x1 font-semibold text-center">Login</h2> 
             {error && <div className="error-message">{error}</div>}
           </div>
          <form className="space-y-4 p-2" onSubmit={handleSubmit }>
          <div>
           <input
              type="text"
              className='w-[90%] p-3 border-b-2 border-gray-300 outline-none focus:border-cyan-500 placeholder-gray-400'
              placeholder='Username'
             value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
         </div>
        
          <div className="space-y-4">
           <input
            className='w-[90%] p-3 border-b-2 border-gray-300 outline-none focus:border-cyan-500 placeholder-gray-400'
            placeholder='Password'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br/>
          </div>
          </form>
            <div className='flex justify-center mt-4'>
           <button className=' justify-center w-[70%] p-3 bg-blue-300 text-white rounded-full text-lg font-medium hover:opacity-90 transition' type="submit" onClick={handleSubmit}>Login</button>
           </div>
           <div className='flex justify-center p-3'>
             <p className='text-gray-500'>Don't have an account? <button type = 'submit' className='text-blue-500 hover:underline' onClick={navRegister}> Register </button> </p>
           </div>
           <br/>
          
        </div>
      </div>
    </div>
  );
}

export default Login;