
/**
 * Organization Settings Page
 * Sprint 35: Manage organization info, members, roles
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Building2, Users, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tier: string;
  currentMembers: number;
  maxMembers: number;
  currentProjects: number;
  maxProjects: number;
}

interface Member {
  id: string;
  role: string;
  status: string;
  joinedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export default function OrganizationSettingsPage() {
  const { data: session } = useSession() || {};
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      loadOrganization(selectedOrgId);
      loadMembers(selectedOrgId);
    }
  }, [selectedOrgId]);

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setEmail(organization.email || '');
      setPhone(organization.phone || '');
      setAddress(organization.address || '');
    }
  }, [organization]);

  async function loadOrganizations() {
    try {
      const res = await fetch('/api/org');
      if (!res.ok) throw new Error('Failed to fetch organizations');
      const data = await res.json();
      setOrganizations(data.organizations);
      if (data.organizations.length > 0) {
        setSelectedOrgId(data.organizations[0].id);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  }

  async function loadOrganization(orgId: string) {
    try {
      const res = await fetch(`/api/org/${orgId}`);
      if (!res.ok) throw new Error('Failed to fetch organization');
      const data = await res.json();
      setOrganization(data.organization);
    } catch (error) {
      console.error('Error loading organization:', error);
      toast.error('Erro ao carregar organização');
    }
  }

  async function loadMembers(orgId: string) {
    try {
      const res = await fetch(`/api/org/${orgId}/members`);
      if (!res.ok) throw new Error('Failed to fetch members');
      const data = await res.json();
      setMembers(data.members);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Erro ao carregar membros');
    }
  }

  async function handleSave() {
    if (!selectedOrgId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/org/${selectedOrgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, address }),
      });

      if (!res.ok) throw new Error('Failed to update organization');

      const data = await res.json();
      setOrganization(data.organization);
      toast.success('Organização atualizada!');
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Erro ao atualizar organização');
    } finally {
      setSaving(false);
    }
  }

  async function handleInvite() {
    if (!selectedOrgId || !inviteEmail) return;

    setInviting(true);
    try {
      const res = await fetch(`/api/org/${selectedOrgId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to invite member');
      }

      toast.success('Convite enviado!');
      setInviteEmail('');
      loadMembers(selectedOrgId);
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast.error(error.message || 'Erro ao convidar membro');
    } finally {
      setInviting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Nenhuma Organização</h2>
          <p className="text-muted-foreground mb-4">
            Você ainda não faz parte de nenhuma organização.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Configurações da Organização</h1>
            <p className="text-muted-foreground">
              Gerencie informações, membros e permissões
            </p>
          </div>
        </div>

        {/* Organization Selector */}
        {organizations.length > 1 && (
          <Card className="p-4">
            <Label htmlFor="org-select">Selecionar Organização</Label>
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
              <SelectTrigger id="org-select" className="mt-2">
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

        {/* Organization Info */}
        {organization && (
          <>
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Informações da Organização
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome da organização"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@empresa.com.br"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={organization.slug}
                    disabled
                    className="mt-1 opacity-60"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Endereço completo"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
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
            </Card>

            {/* Usage Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Uso & Limites</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plano</p>
                  <p className="text-2xl font-bold">{organization.tier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Membros</p>
                  <p className="text-2xl font-bold">
                    {organization.currentMembers} / {organization.maxMembers}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Projetos</p>
                  <p className="text-2xl font-bold">
                    {organization.currentProjects} / {organization.maxProjects}
                  </p>
                </div>
              </div>
            </Card>

            {/* Members */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Membros ({members.length})
              </h3>

              {/* Invite Form */}
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <Label htmlFor="invite-email" className="mb-2 block">
                  Convidar Novo Membro
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="flex-1"
                  />
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">Visualizador</SelectItem>
                      <SelectItem value="MEMBER">Membro</SelectItem>
                      <SelectItem value="MANAGER">Gerente</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
                    {inviting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Convidar'
                    )}
                  </Button>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {member.user.image ? (
                          <img
                            src={member.user.image}
                            alt={member.user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className="text-primary font-bold">
                            {member.user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{member.role}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
