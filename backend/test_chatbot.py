import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from support.views import ChatAPIView
from support.models import ChatSession
from accounts.models import User
from rest_framework.test import force_authenticate

def test_chatbot_flow():
    # 1. Create Dummy User
    user, created = User.objects.get_or_create(username='testuser', password='password123')
    
    # 2. Create Chat Session
    session = ChatSession.objects.create(user=user)
    print(f"Created Session ID: {session.id}")
    
    # 3. Simulate API Call
    factory = RequestFactory()
    view = ChatAPIView.as_view()
    
    data = {
        'session_id': session.id,
        'message': 'Hello, I need help.'
    }
    
    request = factory.post('/api/support/chat/send/', data, content_type='application/json')
    force_authenticate(request, user=user)
    
    response = view(request)
    
    print(f"API Response Status: {response.status_code}")
    print(f"API Response Data: {response.data}")
    
    if response.status_code == 201:
        print("SUCCESS: Chatbot validation passed.")
    else:
        print("FAILURE: Chatbot validation failed.")

if __name__ == "__main__":
    test_chatbot_flow()
