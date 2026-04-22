from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, MechanicProfile, AdminProfile


class CustomUserAdmin(BaseUserAdmin):
    """Custom admin for the User model with additional fields"""
    
    # Fields to display in the list view
    list_display = ['username', 'email', 'first_name', 'last_name', 'user_role', 'is_staff', 'is_active']
    list_filter = ['user_role', 'is_staff', 'is_active', 'user_inactive', 'state']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']
    
    # Fieldsets for viewing/editing existing users
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'phone', 'photo')}),
        ('Role', {'fields': ('user_role',)}),
        ('Address', {'fields': ('state', 'district', 'place', 'address_line')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'user_inactive', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined', 'created_at')}),
    )
    
    # Fieldsets for adding new users
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'user_role', 'first_name', 'last_name', 'phone'),
        }),
    )
    
    # Make created_at read-only
    readonly_fields = ['created_at', 'date_joined', 'last_login']


class MechanicProfileAdmin(admin.ModelAdmin):
    """Admin for MechanicProfile model"""
    list_display = ['user', 'approval_status', 'min_service_fee', 'min_breakdown_fee', 'avg_rating', 'is_available', 'created_at']
    list_filter = ['approval_status', 'is_available']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'avg_rating']
    
    # Quick actions for approving/rejecting mechanics
    actions = ['approve_mechanics', 'reject_mechanics', 'block_mechanics']
    
    def approve_mechanics(self, request, queryset):
        queryset.update(approval_status='APPROVED')
        self.message_user(request, f'{queryset.count()} mechanic(s) approved.')
    approve_mechanics.short_description = 'Approve selected mechanics'
    
    def reject_mechanics(self, request, queryset):
        queryset.update(approval_status='REJECTED')
        self.message_user(request, f'{queryset.count()} mechanic(s) rejected.')
    reject_mechanics.short_description = 'Reject selected mechanics'
    
    def block_mechanics(self, request, queryset):
        queryset.update(approval_status='BLOCKED')
        self.message_user(request, f'{queryset.count()} mechanic(s) blocked.')
    block_mechanics.short_description = 'Block selected mechanics'


class AdminProfileAdmin(admin.ModelAdmin):
    """Admin for AdminProfile model"""
    list_display = ['user', 'notes']
    search_fields = ['user__username', 'user__email', 'notes']


# Register models with the admin site
admin.site.register(User, CustomUserAdmin)
admin.site.register(MechanicProfile, MechanicProfileAdmin)
admin.site.register(AdminProfile, AdminProfileAdmin)
