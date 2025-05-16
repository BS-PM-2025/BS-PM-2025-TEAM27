from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from .models import ContactMessage

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('username', 'email', 'role', 'is_active')
    list_filter = ('role', 'is_active', 'is_staff')
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )
admin.site.register(User, CustomUserAdmin)

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'subject', 'created_at']
    readonly_fields = ['user', 'subject', 'message', 'created_at']