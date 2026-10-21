// Las pruebas usan la BD abarrotes_test, nunca la de desarrollo.
import 'dotenv/config'

process.env.DATABASE_URL = process.env.DATABASE_URL_TEST
