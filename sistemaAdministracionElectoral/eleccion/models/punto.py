from django.db import models
from eleccion.models.seccion import Seccion
class Punto(models.Model):
    latitud = models.FloatField()
    longitud = models.FloatField()
    seccion = models.ForeignKey(
        Seccion, on_delete=models.CASCADE, related_name='puntos'
    )

    def __str__(self):
        return f"Punto ({self.latitud}, {self.longitud}) - Sección: {self.seccion.nombre}"

