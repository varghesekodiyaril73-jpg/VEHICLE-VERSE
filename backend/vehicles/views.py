from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import Vehicle
from .serializers import VehicleSerializer


class VehicleListCreateView(generics.ListCreateAPIView):
    """
    List all vehicles for the authenticated user or create a new vehicle.
    GET /api/vehicles/ - List user's vehicles
    POST /api/vehicles/ - Create a new vehicle
    """
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only vehicles belonging to the authenticated user"""
        return Vehicle.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        """Automatically set the user to the authenticated user"""
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'message': 'Vehicle added successfully!',
            'vehicle': serializer.data
        }, status=status.HTTP_201_CREATED)


class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific vehicle.
    GET /api/vehicles/<id>/ - Get vehicle details
    PUT/PATCH /api/vehicles/<id>/ - Update vehicle
    DELETE /api/vehicles/<id>/ - Delete vehicle
    """
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only vehicles belonging to the authenticated user"""
        return Vehicle.objects.filter(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'message': 'Vehicle updated successfully!',
            'vehicle': serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        vehicle_name = instance.vehicle_name
        self.perform_destroy(instance)
        
        return Response({
            'message': f'Vehicle "{vehicle_name}" deleted successfully!'
        }, status=status.HTTP_200_OK)
