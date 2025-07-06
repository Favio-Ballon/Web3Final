from django.db import models


class Recinto(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    latitud = models.FloatField()
    longitud = models.FloatField()
    elecciones = models.ManyToManyField(
        'eleccion.Eleccion', through='eleccion.Mesa', related_name='recintos'
    )

    def __str__(self):
        return self.nombre

