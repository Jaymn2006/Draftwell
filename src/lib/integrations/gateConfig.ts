/**
 * Draftwell Controlled Deployment Checkpoint Gate
 * 
 * Strict Two-Stage Gateway for third-party production integrations.
 * Code remains in a safe, silent local-mock mode until explicitly activated via environment variables.
 */

export interface IntegrationGateState {
  mediaCdnEnabled: boolean
  telemetryEnabled: boolean
  edgeGateEnabled: boolean
}

function parseBooleanEnv(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const clean = value.trim().toLowerCase()
    return clean === 'true' || clean === '1' || clean === 'enabled'
  }
  return false
}

export const GATE_CONFIG = {
  get mediaCdn(): boolean {
    return parseBooleanEnv(import.meta.env.VITE_ALLOW_MEDIA_CDN)
  },
  get telemetry(): boolean {
    return parseBooleanEnv(import.meta.env.VITE_ALLOW_TELEMETRY)
  },
  get edgeGate(): boolean {
    return parseBooleanEnv(import.meta.env.VITE_ALLOW_EDGE_GATE)
  },
  getState(): IntegrationGateState {
    return {
      mediaCdnEnabled: this.mediaCdn,
      telemetryEnabled: this.telemetry,
      edgeGateEnabled: this.edgeGate,
    }
  },
}
