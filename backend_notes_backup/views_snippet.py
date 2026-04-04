from rest_framework import viewsets, filters, status, permissions 
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.generics import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Note, CategorySubscription, ExamCategory
from ..serializers import NoteSerializer, CategorySubscriptionSerializer

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['exam', 'subject', 'note_type', 'is_premium']
    search_fields = ['title']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

class CategorySubscriptionViewSet(viewsets.ModelViewSet):
    queryset = CategorySubscription.objects.all()
    serializer_class = CategorySubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        category_id = request.data.get('category')
        category = get_object_or_404(ExamCategory, id=category_id)
        
        # In a real app, you'd check payment here.
        # For now, we just create the subscription.
        subscription, created = CategorySubscription.objects.get_or_create(
            user=request.user,
            category=category,
            defaults={'is_active': True}
        )
        
        if not created and not subscription.is_active:
            subscription.is_active = True
            subscription.save()
            
        serializer = self.get_serializer(subscription)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CheckPremiumAccessView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Check if user has premium access to a category or book
        """
        access_type = request.query_params.get('type')
        item_id = request.query_params.get('id')
        
        if not access_type or not item_id:
            return Response({'error': 'Missing parameters'}, status=status.HTTP_400_BAD_REQUEST)
        
        if access_type == 'category':
            has_access = CategorySubscription.objects.filter(
                user=request.user,
                category_id=item_id,
                is_active=True
            ).exists()
        else:
            return Response({'error': 'Invalid type/Not Implemented'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'has_access': has_access}, status=status.HTTP_200_OK)
