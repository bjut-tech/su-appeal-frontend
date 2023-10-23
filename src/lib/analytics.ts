let injected = false

export const injectAnalytics = (): void => {
  if (injected || !import.meta.env.PROD) {
    return
  }

  const script = document.createElement('script')

  if (import.meta.env.VITE_ANALYTICS_CF_TOKEN) {
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
    script.defer = true
    script.dataset.cfBeacon = JSON.stringify({
      token: import.meta.env.VITE_ANALYTICS_CF_TOKEN,
      spa: true
    })
  } else {
    return
  }

  document.body.appendChild(script)
  injected = true
}
