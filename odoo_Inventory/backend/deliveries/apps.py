from django.apps import AppConfig

class DeliveriesConfig(AppConfig):
    name = 'deliveries'

    def ready(self):
        import deliveries.signals
