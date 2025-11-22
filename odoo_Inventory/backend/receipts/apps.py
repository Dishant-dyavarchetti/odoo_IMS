from django.apps import AppConfig

class ReceiptsConfig(AppConfig):
    name = 'receipts'

    def ready(self):
        import receipts.signals
