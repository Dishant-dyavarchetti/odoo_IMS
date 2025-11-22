import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/services/api';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authAPI.login(username, password);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.non_field_errors?.[0] || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
                {/* Left Side - Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16">
                    <div className="mb-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl mb-6 shadow-lg"></div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Login</h1>
                        <p className="text-gray-500 text-lg">See your growth and get support!</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Username Input */}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                                Username*
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                Password*
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="minimum 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                                minLength={8}
                                disabled={loading}
                            />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                />
                                <label
                                    htmlFor="remember"
                                    className="text-sm text-gray-700 cursor-pointer"
                                >
                                    Remember me
                                </label>
                            </div>
                            <a
                                href="#"
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Forgot password?
                            </a>
                        </div>

                        {/* Login Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>

                        {/* Sign Up Link */}
                        <p className="text-center text-sm text-gray-600">
                            Not registered yet?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Create a new account
                            </button>
                        </p>
                    </form>
                </div>

                {/* Right Side - Illustration */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 items-center justify-center p-12 relative overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center text-white">
                        <div className="mb-6">
                            <svg className="w-64 h-64 mx-auto" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Chart/Analytics illustration */}
                                <circle cx="100" cy="100" r="80" fill="white" fillOpacity="0.1" />
                                <path d="M60 120 L80 100 L100 110 L120 80 L140 90" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="60" cy="120" r="6" fill="white" />
                                <circle cx="80" cy="100" r="6" fill="white" />
                                <circle cx="100" cy="110" r="6" fill="white" />
                                <circle cx="120" cy="80" r="6" fill="white" />
                                <circle cx="140" cy="90" r="6" fill="white" />
                                {/* Bar chart */}
                                <rect x="50" y="140" width="15" height="30" fill="white" fillOpacity="0.8" rx="2" />
                                <rect x="75" y="130" width="15" height="40" fill="white" fillOpacity="0.8" rx="2" />
                                <rect x="100" y="120" width="15" height="50" fill="white" fillOpacity="0.8" rx="2" />
                                <rect x="125" y="135" width="15" height="35" fill="white" fillOpacity="0.8" rx="2" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Track Your Growth</h2>
                        <p className="text-lg text-white/90 max-w-md mx-auto">
                            Visualize your progress with powerful analytics and get the support you need to succeed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;