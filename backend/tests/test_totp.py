import unittest


try:
    from app.totp import hotp_code, totp_code, verify_totp
except ModuleNotFoundError:
    hotp_code = totp_code = verify_totp = None


RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"


class OfflineCodeTests(unittest.TestCase):
    def test_totp_uses_a_six_digit_thirty_second_code(self):
        self.assertIsNotNone(totp_code, "TOTP module must export totp_code")
        self.assertEqual(totp_code(RFC_SECRET, timestamp=59), "287082")

    def test_totp_rejects_an_incorrect_code(self):
        self.assertIsNotNone(verify_totp, "TOTP module must export verify_totp")
        self.assertFalse(verify_totp(RFC_SECRET, "000000", timestamp=59))

    def test_hotp_matches_the_truncated_rfc_counter_value(self):
        self.assertIsNotNone(hotp_code, "TOTP module must export hotp_code")
        self.assertEqual(hotp_code(RFC_SECRET, counter=0), "755224")
