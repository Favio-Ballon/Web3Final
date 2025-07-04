from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('super_admin', 'Super Administrador'),
        ('admin_padron', 'Administrador Padrón'),
        ('admin_elecciones', 'Administrador Elecciones'),
        ('jurado', 'Jurado Electoral'),
    )
    rol = models.CharField(max_length=30, choices=ROLE_CHOICES)