from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer
import time

class ChatSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).order_by('-started_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        session_id = request.data.get('session_id')
        message_text = request.data.get('message')

        if not session_id or not message_text:
            return Response({"error": "session_id and message are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Get session and ensure it belongs to user
        session = get_object_or_404(ChatSession, id=session_id, user=request.user)

        # 1. Save User Message
        user_msg = ChatMessage.objects.create(session=session, sender='USER', message=message_text)

        # 2. Process Bot Logic (Placeholder for LLM)
        # Verify simple keywords or default response
        bot_response_text = self.get_bot_response(message_text)

        # 3. Save Bot Message
        bot_msg = ChatMessage.objects.create(session=session, sender='BOT', message=bot_response_text)

        return Response({
            "user_message": ChatMessageSerializer(user_msg).data,
            "bot_message": ChatMessageSerializer(bot_msg).data
        }, status=status.HTTP_201_CREATED)

    def get_bot_response(self, text):
        # Placeholder logic provided as requested
        text_lower = text.lower()
        if "hello" in text_lower:
            return "Hello! How can I assist you with your vehicle today?"
        elif "price" in text_lower or "cost" in text_lower:
            return "Our service charges start from $50. You can view the full price list in your app."
        elif "book" in text_lower:
            return "To book a service, please go to the 'Bookings' tab."
        else:
            return "I am an AI assistant. I will forward your query to our support team."
