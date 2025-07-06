from django.db import models
from eleccion.models.seccion import Seccion

class Cargo(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    seccion = models.ForeignKey(
        Seccion, on_delete=models.CASCADE, related_name='cargos'
    )

    def __str__(self):
        return f"{self.nombre} - Sección: {self.seccion.nombre}"