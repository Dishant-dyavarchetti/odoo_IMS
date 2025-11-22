from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, OTPVerification


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active', 'created_at', 'password', 'password_confirm']
        read_only_fields = ['id', 'created_at']
    
    def validate(self, data):
        # If password is provided, validate it
        if 'password' in data:
            if 'password_confirm' not in data:
                raise serializers.ValidationError({"password_confirm": "Password confirmation is required"})
            if data['password'] != data['password_confirm']:
                raise serializers.ValidationError({"password": "Passwords do not match"})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        return super().update(instance, validated_data)


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'role', 'phone']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled")
            data['user'] = user
        else:
            raise serializers.ValidationError("Must include username and password")
        
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email")
        return value


class PasswordResetVerifySerializer(serializers.Serializer):
    """Serializer for OTP verification"""
    
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)
    
    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
            otp_obj = OTPVerification.objects.filter(
                user=user,
                otp=data['otp'],
                is_used=False
            ).order_by('-created_at').first()
            
            if not otp_obj or not otp_obj.is_valid():
                raise serializers.ValidationError({"otp": "Invalid or expired OTP"})
            
            data['user'] = user
            data['otp_obj'] = otp_obj
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User not found"})
        
        return data


class OTPVerificationSerializer(serializers.ModelSerializer):
    """Serializer for OTP"""
    
    class Meta:
        model = OTPVerification
        fields = ['id', 'otp', 'is_used', 'created_at', 'expires_at']
        read_only_fields = ['id', 'otp', 'created_at', 'expires_at']
