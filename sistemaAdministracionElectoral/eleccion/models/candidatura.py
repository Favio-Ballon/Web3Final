from django.db import models
from eleccion.models.eleccion import Eleccion
from eleccion.models.cargo import Cargo

class Candidatura(models.Model):
    partido_politico = models.CharField(max_length=100)
    sigla = models.CharField(max_length=10)
    candidato = models.CharField(max_length=100, null=True, blank=True)
    color = models.CharField(max_length=20)
    cargo = models.ForeignKey(Cargo, on_delete=models.CASCADE, related_name='candidaturas_cargo')
    eleccion = models.ForeignKey(Eleccion, on_delete=models.CASCADE, related_name='candidaturas_eleccion')

    def __str__(self):
        return f"Candidatura {self.partido_politico} - {self.cargo.nombre} ({self.eleccion.nombre})"