from django.db import models
from eleccion.models.seccion import Seccion

class Eleccion(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    fecha = models.DateField()
    seccion = models.ForeignKey(
        Seccion, on_delete=models.CASCADE, related_name='elecciones'
    )

    def __str__(self):
        return f"Elección: {self.nombre} - Sección: {self.seccion.nombre}"
