
/**
 * White-Label Appearance Settings Page
 * Sprint 35: Customize branding, colors, logo, domain
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Palette, Upload, Loader2, Eye, AlertTriangle, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Organization {
  id: string;
  name: string;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
}

interface WhiteLabelSettings {
  logoUrl: string | null;
  faviconUrl: string | null;
  companyName: string | null;
  tagline: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  customDomain: string | null;
  domainVerified: boolean;
  welcomeMessage: string | null;
  footerText: string | null;
  isActive: boolean;
}

export default function AppearanceSettingsPage() {
  const { data: session } = useSession() || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [currentTier, setCurrentTier] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('FREE');
  const [settings, setSettings] = useState<WhiteLabelSettings>({
    logoUrl: null,
    faviconUrl: null,
    companyName: null,
    tagline: null,
    primaryColor: '#0066cc',
    secondaryColor: '#f0f0f0',
    accentColor: '#ff6b35',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    fontFamily: 'Inter',
    customDomain: null,
    domainVerified: false,
    welcomeMessage: null,
    footerText: null,
    isActive: false,
  });

  const hasWhiteLabel = currentTier === 'PRO' || currentTier === 'ENTERPRISE';

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      loadSettings(selectedOrgId);
    }
  }, [selectedOrgId]);

  async function loadOrganizations() {
    try {
      const res = await fetch('/api/org');
      if (!res.ok) throw new Error('Failed to fetch organizations');
      const data = await res.json();
      setOrganizations(data.organizations);
      if (data.organizations.length > 0) {
        setSelectedOrgId(data.organizations[0].id);
        setCurrentTier(data.organizations[0].tier);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  }

  async function loadSettings(orgId: string) {
    try {
      const res = await fetch(`/api/white-label?orgId=${orgId}`);
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async function handleSave() {
    if (!selectedOrgId) return;

    if (!hasWhiteLabel) {
      toast.error('Recursos de white-label requerem plano Pro ou Enterprise');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/white-label', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: selectedOrgId,
          ...settings,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      toast.success('Configurações salvas!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Palette className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Aparência & White-Label
            </h1>
            <p className="text-muted-foreground">
              Personalize a identidade visual da sua organização
            </p>
          </div>
        </div>

        {/* Organization Selector */}
        {organizations.length > 1 && (
          <Card className="p-4">
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name} ({org.tier})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        )}

        {/* Pro/Enterprise Feature Lock */}
        {!hasWhiteLabel && (
          <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-2">
                  Recurso Pro/Enterprise
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                  White-label e customização de aparência estão disponíveis apenas
                  nos planos Pro e Enterprise.
                </p>
                <Button variant="outline" size="sm">
                  Fazer Upgrade
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Branding */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Identidade Visual</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                value={settings.companyName || ''}
                onChange={(e) =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
                placeholder="Minha Empresa"
                disabled={!hasWhiteLabel}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tagline">Slogan/Tagline</Label>
              <Input
                id="tagline"
                value={settings.tagline || ''}
                onChange={(e) =>
                  setSettings({ ...settings, tagline: e.target.value })
                }
                placeholder="Transformando ideias em vídeos"
                disabled={!hasWhiteLabel}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Logo</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="text"
                  value={settings.logoUrl || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, logoUrl: e.target.value })
                  }
                  placeholder="URL do logo"
                  disabled={!hasWhiteLabel}
                />
                <Button variant="outline" size="icon" disabled={!hasWhiteLabel}>
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Favicon</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="text"
                  value={settings.faviconUrl || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, faviconUrl: e.target.value })
                  }
                  placeholder="URL do favicon"
                  disabled={!hasWhiteLabel}
                />
                <Button variant="outline" size="icon" disabled={!hasWhiteLabel}>
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Colors */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Paleta de Cores</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'primaryColor', label: 'Cor Primária' },
              { key: 'secondaryColor', label: 'Cor Secundária' },
              { key: 'accentColor', label: 'Cor de Destaque' },
              { key: 'backgroundColor', label: 'Fundo' },
              { key: 'textColor', label: 'Texto' },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label htmlFor={key}>{label}</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    id={key}
                    type="color"
                    value={settings[key as keyof WhiteLabelSettings] as string}
                    onChange={(e) =>
                      setSettings({ ...settings, [key]: e.target.value })
                    }
                    disabled={!hasWhiteLabel}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={settings[key as keyof WhiteLabelSettings] as string}
                    onChange={(e) =>
                      setSettings({ ...settings, [key]: e.target.value })
                    }
                    disabled={!hasWhiteLabel}
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Typography */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Tipografia</h3>
          <div>
            <Label htmlFor="fontFamily">Fonte</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) =>
                setSettings({ ...settings, fontFamily: value })
              }
              disabled={!hasWhiteLabel}
            >
              <SelectTrigger id="fontFamily" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
                <SelectItem value="Poppins">Poppins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Custom Domain */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Domínio Customizado</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customDomain">Domínio</Label>
              <Input
                id="customDomain"
                value={settings.customDomain || ''}
                onChange={(e) =>
                  setSettings({ ...settings, customDomain: e.target.value })
                }
                placeholder="videos.minhaempresa.com.br"
                disabled={!hasWhiteLabel}
                className="mt-1"
              />
              {settings.domainVerified && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ✓ Domínio verificado
                </p>
              )}
            </div>

            {settings.customDomain && !settings.domainVerified && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm">
                <p className="font-medium mb-2">Configure seu DNS:</p>
                <code className="block bg-white dark:bg-gray-900 p-2 rounded mb-2">
                  CNAME {settings.customDomain} → estudioai.com.br
                </code>
                <Button variant="outline" size="sm" disabled={!hasWhiteLabel}>
                  Verificar Domínio
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Custom Content */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Conteúdo Personalizado</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="welcomeMessage">Mensagem de Boas-Vindas</Label>
              <Textarea
                id="welcomeMessage"
                value={settings.welcomeMessage || ''}
                onChange={(e) =>
                  setSettings({ ...settings, welcomeMessage: e.target.value })
                }
                placeholder="Bem-vindo ao nosso estúdio de vídeos..."
                disabled={!hasWhiteLabel}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="footerText">Texto do Rodapé</Label>
              <Input
                id="footerText"
                value={settings.footerText || ''}
                onChange={(e) =>
                  setSettings({ ...settings, footerText: e.target.value })
                }
                placeholder="© 2025 Minha Empresa. Todos os direitos reservados."
                disabled={!hasWhiteLabel}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Preview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Pré-visualização</h3>
            <Button variant="outline" size="sm" disabled={!hasWhiteLabel}>
              <Eye className="w-4 h-4 mr-2" />
              Ver Preview
            </Button>
          </div>
          <div
            className="p-8 rounded-lg border-2"
            style={{
              backgroundColor: settings.backgroundColor,
              color: settings.textColor,
              borderColor: settings.primaryColor,
            }}
          >
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: settings.primaryColor }}
            >
              {settings.companyName || 'Sua Empresa'}
            </h1>
            <p className="text-lg" style={{ color: settings.accentColor }}>
              {settings.tagline || 'Seu slogan aqui'}
            </p>
            <Button
              className="mt-4"
              style={{
                backgroundColor: settings.primaryColor,
                color: settings.backgroundColor,
              }}
            >
              Botão de Exemplo
            </Button>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => loadSettings(selectedOrgId)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasWhiteLabel}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
