from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import random
import string


class User(AbstractUser):
    """Custom user model with role-based access"""
    
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('INVENTORY_MANAGER', 'Inventory Manager'),
        ('WAREHOUSE_STAFF', 'Warehouse Staff'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='WAREHOUSE_STAFF')
    phone = models.CharField(max_length=15, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class OTPVerification(models.Model):
    """OTP model for password reset"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    otp = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'otp_verifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP for {self.user.username}"
    
    def is_valid(self):
        """Check if OTP is still valid"""
        return not self.is_used and timezone.now() < self.expires_at
    
    @staticmethod
    def generate_otp():
        """Generate a 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))
    
    def save(self, *args, **kwargs):
        if not self.otp:
            self.otp = self.generate_otp()
        if not self.expires_at:
            # OTP valid for 10 minutes
            self.expires_at = timezone.now() + timezone.timedelta(minutes=10)
        super().save(*args, **kwargs)
