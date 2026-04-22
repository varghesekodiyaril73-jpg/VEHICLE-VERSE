from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatSessionViewSet, ChatAPIView

router = DefaultRouter()
router.register(r'chat/sessions', ChatSessionViewSet, basename='chat-sessions')

urlpatterns = [
    path('', include(router.urls)),
    path('chat/send/', ChatAPIView.as_view(), name='chat-send'),
]
