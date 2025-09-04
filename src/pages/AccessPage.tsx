import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DualApproval } from '@/components/DualApproval';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import type { AccessEvent, Gate, User } from '@/types';

export default function AccessPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [gates, setGates] = useState<Gate[]>([]);
  const [accessEvents, setAccessEvents] = useState<AccessEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [gatesRes, eventsRes, usersRes] = await Promise.all([
        fetch('/seeds/gates.json'),
        fetch('/seeds/access_events.json'),
        fetch('/seeds/users.json')
      ]);

      setGates(await gatesRes.json());
      setAccessEvents(await eventsRes.json());
      setUsers(await usersRes.json());
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const supervisors = users.filter(u => u.role === 'SecuritySupervisor');
  const commanders = users.filter(u => u.role === 'IncidentCommander');

  return (
    <div className="h-full p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('nav.access')}</h1>
      </div>

      <Tabs defaultValue="events" className="h-full">
        <TabsList>
          <TabsTrigger value="events">Access Events</TabsTrigger>
          <TabsTrigger value="gates">Gate Status</TabsTrigger>
          <TabsTrigger value="control">Dual Approval Control</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {accessEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{event.personId} - Badge {event.badgeId}</div>
                      <div className="text-sm text-muted-foreground">Gate ID: {event.gateId}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={event.direction === 'IN' ? 'default' : 'secondary'}>
                        {event.direction}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.time).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gates.map((gate) => (
              <Card key={gate.id}>
                <CardHeader>
                  <CardTitle className="text-sm">{gate.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Site: {gate.site}</div>
                    <div className="text-sm text-muted-foreground">
                      Policy: {gate.controlPolicy}
                    </div>
                    <Badge variant="outline">Secure</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="control">
          <DualApproval
            currentUser={user}
            supervisors={supervisors}
            commanders={commanders}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}