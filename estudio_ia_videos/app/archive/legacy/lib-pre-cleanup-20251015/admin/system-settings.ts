
/**
 * 🎨 System Settings Manager - Gerenciamento das configurações do sistema
 */

import { prisma } from '@/lib/prisma'

export interface SystemSettingsData {
  id?: string
  logoUrl?: string | null
  faviconUrl?: string | null
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  companyName: string
  subtitle: string
  websiteUrl?: string | null
  supportEmail?: string | null
  fontFamily: string
  documentTitle: string
  privacyPolicyUrl?: string | null
  termsOfServiceUrl?: string | null
  customSettings?: any
  version: string
  isActive: boolean
}

export class SystemSettingsManager {
  static async getCurrentSettings(): Promise<SystemSettingsData> {
    try {
      const settings = await prisma.systemSettings.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
      })

      if (settings) {
        return settings as SystemSettingsData
      }

      // Return default settings if none exist
      const defaultSettings: SystemSettingsData = {
        primaryColor: "#0066cc",
        secondaryColor: "#f0f0f0", 
        backgroundColor: "#ffffff",
        textColor: "#333333",
        companyName: "Estúdio IA de Vídeos",
        subtitle: "Transforme apresentações em vídeos inteligentes",
        fontFamily: "Inter",
        documentTitle: "Estúdio IA de Vídeos",
        version: "1.0",
        isActive: true
      }

      // Create default settings in database
      const created = await prisma.systemSettings.create({
        data: defaultSettings
      })

      return created as SystemSettingsData
    } catch (error) {
      console.error('Error fetching system settings:', error)
      throw error
    }
  }

  static async updateSettings(data: Partial<SystemSettingsData>): Promise<SystemSettingsData> {
    try {
      // First, deactivate current settings
      await prisma.systemSettings.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })

      // Create new version with updated data
      const updated = await prisma.systemSettings.create({
        data: {
          ...await this.getCurrentSettings(),
          ...data,
          isActive: true,
          version: `${parseFloat(data.version || "1.0") + 0.1}`,
        }
      })

      return updated as SystemSettingsData
    } catch (error) {
      console.error('Error updating system settings:', error)
      throw error
    }
  }

  static async exportSettings(): Promise<SystemSettingsData> {
    const settings = await this.getCurrentSettings()
    return settings
  }

  static async importSettings(data: Partial<SystemSettingsData>): Promise<SystemSettingsData> {
    return await this.updateSettings(data)
  }
}
