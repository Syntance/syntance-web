import { isGa4Configured } from '@/lib/analytics/ga4'

const CONSENT_DEFAULT_SCRIPT = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  analytics_storage:'denied',
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  functionality_storage:'denied',
  personalization_storage:'denied',
  security_storage:'granted',
  wait_for_update:500
});
`

export function GoogleConsentDefaultScript() {
  if (!isGa4Configured()) return null

  return (
    <script
      id="google-consent-default"
      dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }}
    />
  )
}
