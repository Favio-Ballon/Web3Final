from django.db import models
class Seccion(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    tipo = models.CharField(null= True, blank=True, max_length=50)

    def __str__(self):
        return self.nombre

