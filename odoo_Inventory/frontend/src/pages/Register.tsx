import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/services/api';
import { toast } from 'react-toastify';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'WAREHOUSE_STAFF' as 'ADMIN' | 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF',
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreedToTerms) {
            toast.error('Please agree to terms and policies');
            return;
        }
        
        setLoading(true);
        try {
            const response = await authAPI.register({
                username: formData.username,
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            toast.success('Registration successful!');
            navigate('/dashboard');
        } catch (error: any) {
            const errorMsg = error.response?.data?.username?.[0] || 
                           error.response?.data?.email?.[0] || 
                           error.response?.data?.password?.[0] || 
                           'Registration failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-row-reverse">
                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16">
                    <div className="mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl mb-6 shadow-lg"></div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Register</h1>
                        <p className="text-gray-500 text-base">
                            Manage all your inventory efficiently
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            Let's get you all set up so you can verify your personal account and begin setting up your work profile
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                                Username*
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* First Name & Last Name Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                                    First name*
                                </Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    placeholder="Enter your first name"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                                    Last name*
                                </Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    placeholder="Enter your last name"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                Email*
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                Password*
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Minimum 8 characters"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                                minLength={8}
                                disabled={loading}
                            />
                        </div>

                        {/* Terms Agreement */}
                        <div className="flex items-start space-x-3 pt-2">
                            <Checkbox
                                id="terms"
                                checked={agreedToTerms}
                                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                                className="mt-0.5"
                            />
                            <label
                                htmlFor="terms"
                                className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                            >
                                I agree to all terms, privacy policies, and fees
                            </label>
                        </div>

                        {/* Sign Up Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
                        </Button>

                        {/* Login Link */}
                        <p className="text-center text-sm text-gray-600 pt-2">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                            >
                                Log in
                            </button>
                        </p>
                    </form>
                </div>

                {/* Left Side - Illustration */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 items-center justify-center p-12 relative overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>

                    {/* Isometric Illustration */}
                    <div className="relative z-10">
                        <svg className="w-96 h-96" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Platform base */}
                            <path d="M200 280 L280 240 L280 180 L200 220 Z" fill="white" fillOpacity="0.9" />
                            <path d="M120 240 L200 280 L200 220 L120 180 Z" fill="white" fillOpacity="0.7" />
                            <path d="M120 180 L200 220 L280 180 L200 140 Z" fill="white" fillOpacity="0.95" />

                            {/* Left chart panel */}
                            <path d="M80 180 L120 160 L120 120 L80 140 Z" fill="#4F46E5" fillOpacity="0.8" />
                            <path d="M80 140 L120 120 L120 80 L80 100 Z" fill="#6366F1" fillOpacity="0.9" />

                            {/* Chart lines on left panel */}
                            <line x1="90" y1="125" x2="110" y2="115" stroke="white" strokeWidth="2" />
                            <circle cx="90" cy="125" r="2" fill="white" />
                            <circle cx="100" cy="120" r="2" fill="white" />
                            <circle cx="110" cy="115" r="2" fill="white" />

                            {/* Right chart panel */}
                            <path d="M280 160 L320 140 L320 100 L280 120 Z" fill="#EC4899" fillOpacity="0.8" />
                            <path d="M280 120 L320 100 L320 60 L280 80 Z" fill="#F472B6" fillOpacity="0.9" />

                            {/* Bars on right panel */}
                            <rect x="290" y="110" width="8" height="15" fill="white" fillOpacity="0.9" />
                            <rect x="302" y="105" width="8" height="20" fill="white" fillOpacity="0.9" />
                            <rect x="314" y="100" width="8" height="25" fill="white" fillOpacity="0.9" />

                            {/* Center dashboard */}
                            <path d="M160 200 L240 200 L240 160 L160 160 Z" fill="#6366F1" fillOpacity="0.3" stroke="white" strokeWidth="2" />
                            <rect x="170" y="170" width="60" height="3" fill="white" fillOpacity="0.7" rx="1" />
                            <rect x="170" y="178" width="45" height="3" fill="white" fillOpacity="0.7" rx="1" />
                            <rect x="170" y="186" width="50" height="3" fill="white" fillOpacity="0.7" rx="1" />

                            {/* Person on left */}
                            <ellipse cx="70" cy="245" rx="8" ry="4" fill="#4F46E5" />
                            <circle cx="70" cy="230" r="6" fill="white" />
                            <path d="M70 236 L70 250" stroke="white" strokeWidth="3" strokeLinecap="round" />
                            <path d="M70 242 L65 250" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <path d="M70 242 L75 250" stroke="white" strokeWidth="2" strokeLinecap="round" />

                            {/* Person on right */}
                            <ellipse cx="330" cy="245" rx="8" ry="4" fill="#EC4899" />
                            <circle cx="330" cy="230" r="6" fill="white" />
                            <path d="M330 236 L330 250" stroke="white" strokeWidth="3" strokeLinecap="round" />
                            <path d="M330 242 L325 250" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <path d="M330 242 L335 250" stroke="white" strokeWidth="2" strokeLinecap="round" />

                            {/* Person on platform */}
                            <ellipse cx="220" cy="220" rx="8" ry="4" fill="#6366F1" />
                            <circle cx="220" cy="205" r="6" fill="#4F46E5" />
                            <path d="M220 211 L220 225" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
                            <path d="M220 217 L215 225" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
                            <path d="M220 217 L225 225" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />

                            {/* Floating elements */}
                            <g opacity="0.8">
                                <path d="M140 140 L155 132 L155 120 L140 128 Z" fill="#F472B6" />
                                <path d="M140 128 L155 120 L170 128 L155 136 Z" fill="#EC4899" />
                            </g>

                            <g opacity="0.8">
                                <path d="M250 150 L265 142 L265 130 L250 138 Z" fill="#F59E0B" />
                                <path d="M250 138 L265 130 L280 138 L265 146 Z" fill="#FBBF24" />
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;