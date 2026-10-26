/**
 * Generuje parę kluczy Ed25519 licencji Syntance Studio.
 *  - LICENSE_PRIVATE_KEY → sekret Vercel (Sensitive), NIGDY w repo ani w czacie.
 *  - klucz publiczny → zmienna CI aplikacji desktopowej (FOLIO_LICENSE_PUBLIC_KEY).
 * Uruchom lokalnie: pnpm studio:keygen
 */
import { generateLicenseKeyPair } from '../lib/studio/certificate'

const pair = generateLicenseKeyPair()
console.log('Klucz PUBLICZNY (build aplikacji, FOLIO_LICENSE_PUBLIC_KEY):')
console.log(pair.publicKeySpki)
console.log('\nKlucz PRYWATNY (Vercel → LICENSE_PRIVATE_KEY, Sensitive; nigdzie indziej):')
console.log(pair.privateKeyPem)
