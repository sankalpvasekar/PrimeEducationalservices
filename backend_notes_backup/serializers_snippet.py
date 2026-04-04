from rest_framework import serializers
from ..models import Note, CategorySubscription

class NoteSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    class Meta:
        model = Note
        fields = ['id', 'title', 'description', 'note_type', 'file', 'demo_file', 'link', 'exam', 'subject', 'subject_name', 'is_premium', 'created_at']

class CategorySubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategorySubscription
        fields = '__all__'
