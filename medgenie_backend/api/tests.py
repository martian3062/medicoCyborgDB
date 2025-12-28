from django.test import TestCase

class BasicTest(TestCase):
    def test_ok(self):
        self.assertEqual(1, 1)
