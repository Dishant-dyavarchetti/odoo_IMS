from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.utils import timezone
from .models import User, OTPVerification
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    PasswordResetRequestSerializer, PasswordResetVerifySerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User model"""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Admins can see all users, others only themselves
        if self.request.user.role == 'ADMIN':
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    def perform_create(self, serializer):
        # Only admins can create users via this endpoint
        if self.request.user.role != 'ADMIN':
            raise ValueError("Only admins can create users")
        
        serializer.save()
    
    def perform_update(self, serializer):
        # Only admins can update other users
        if self.request.user.role != 'ADMIN' and serializer.instance.id != self.request.user.id:
            raise ValueError("You can only update your own profile")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only admins can delete users, and can't delete themselves
        if self.request.user.role != 'ADMIN':
            raise ValueError("Only admins can delete users")
        if instance.id == self.request.user.id:
            raise ValueError("You cannot delete your own account")
        
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Reset user password (Admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {'error': 'Only admins can reset passwords'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        new_password = request.data.get('new_password')
        
        if not new_password or len(new_password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password reset successfully'})
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """Register a new user"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """User login"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """User logout"""
        try:
            request.user.auth_token.delete()
        except:
            pass
        return Response({'message': 'Successfully logged out'})
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def request_password_reset(self, request):
        """Request password reset - sends OTP"""
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # Create OTP
            otp = OTPVerification.objects.create(user=user)
            
            # TODO: Send OTP via email (for now, return it in response for testing)
            # In production, integrate with email service
            return Response({
                'message': 'OTP sent to your email',
                'otp': otp.otp  # Remove this in production
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def verify_password_reset(self, request):
        """Verify OTP and reset password"""
        serializer = PasswordResetVerifySerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            otp_obj = serializer.validated_data['otp_obj']
            new_password = serializer.validated_data['new_password']
            
            # Update password
            user.set_password(new_password)
            user.save()
            
            # Mark OTP as used
            otp_obj.is_used = True
            otp_obj.save()
            
            return Response({'message': 'Password reset successful'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
