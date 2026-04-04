from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, CategorySubscriptionViewSet, CheckPremiumAccessView

router = DefaultRouter()
router.register(r'notes', NoteViewSet)
router.register(r'subscriptions', CategorySubscriptionViewSet)

urlpatterns = [
    path('payments/check-access/', CheckPremiumAccessView.as_view(), name='check_premium_access'),
]
