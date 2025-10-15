// Alert System - Sprint 13
// Simplified version for compilation

interface Alert {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
}

export class AlertManager {
  private alerts: Alert[] = []

  async createAlert(type: string, severity: Alert['severity'], message: string) {
    const alert: Alert = {
      id: 'alert-' + Date.now(),
      type,
      severity,
      message,
      timestamp: new Date()
    }
    
    this.alerts.push(alert)
    console.log(`Alert created: ${message}`)
    return alert
  }

  async getAlerts(): Promise<Alert[]> {
    return this.alerts.slice(-50) // Return last 50 alerts
  }
}

export const alertManager = new AlertManager()