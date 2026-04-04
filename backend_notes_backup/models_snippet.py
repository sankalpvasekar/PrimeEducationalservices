from django.db import models

class Note(models.Model):
    NOTE_TYPES = [
        ('PDF', 'PDF'),
        ('Audio', 'Audio'),
        ('Video', 'Video'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    note_type = models.CharField(max_length=10, choices=NOTE_TYPES, default='PDF')
    file = models.FileField(upload_to='notes/', blank=True, null=True)
    demo_file = models.FileField(upload_to='notes/demos/', blank=True, null=True)
    link = models.URLField(blank=True, null=True, help_text="External link for video/audio if not uploaded")
    
    exam = models.ForeignKey('ExamCategory', on_delete=models.CASCADE, related_name='notes')
    subject = models.ForeignKey('Subject', on_delete=models.SET_NULL, null=True, blank=True, related_name='notes')
    
    is_premium = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.note_type})"

class CategorySubscription(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='category_subscriptions')
    category = models.ForeignKey('ExamCategory', on_delete=models.CASCADE, related_name='subscribers')
    purchased_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    payment = models.ForeignKey('Payment', on_delete=models.SET_NULL, null=True, blank=True, related_name='category_subscriptions')

    class Meta:
        unique_together = ('user', 'category')
        verbose_name_plural = "Category Subscriptions"

    def __str__(self):
        return f"{self.user.username} - {self.category.name} Premium"
