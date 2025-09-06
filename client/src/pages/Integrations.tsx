import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { insertIntegrationSchema, type Integration } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";

export default function Integrations() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: integrations = [], isLoading } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
  });

  const form = useForm({
    resolver: zodResolver(insertIntegrationSchema),
    defaultValues: {
      name: "",
      type: "",
      status: "active",
      apiKey: "",
      config: {}
    }
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/integrations", data),
    onSuccess: () => {
      toast({ title: "Integration added", description: "Successfully connected your project management tool." });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add integration. Please check your API key and try again.", variant: "destructive" });
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/integrations/${id}`, data),
    onSuccess: () => {
      toast({ title: "Integration updated", description: "Integration status updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update integration.", variant: "destructive" });
    },
  });

  const onSubmit = (data: any) => {
    createIntegrationMutation.mutate(data);
  };

  const handleSync = (integrationId: string) => {
    updateIntegrationMutation.mutate({
      id: integrationId,
      data: { status: "syncing", lastSync: new Date() }
    });
    
    // Simulate sync completion
    setTimeout(() => {
      updateIntegrationMutation.mutate({
        id: integrationId,
        data: { status: "active" }
      });
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'syncing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'trello':
        return 'fab fa-trello';
      case 'github':
        return 'fab fa-github';
      case 'asana':
        return 'fas fa-tasks';
      default:
        return 'fas fa-plug';
    }
  };

  const getIntegrationColor = (type: string) => {
    switch (type) {
      case 'trello':
        return 'bg-blue-500';
      case 'github':
        return 'bg-gray-800';
      case 'asana':
        return 'bg-orange-500';
      default:
        return 'bg-primary';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Project Management Integrations</h2>
          <p className="text-muted-foreground">Connect your tools to automate report generation</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-integration">
              <i className="fas fa-plus w-4 h-4 mr-2"></i>
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="type">Platform</Label>
                <Select 
                  onValueChange={(value) => form.setValue("type", value)}
                  defaultValue={form.watch("type")}
                >
                  <SelectTrigger data-testid="select-integration-type">
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trello">Trello</SelectItem>
                    <SelectItem value="github">GitHub Projects</SelectItem>
                    <SelectItem value="asana">Asana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="name">Integration Name</Label>
                <Input
                  {...form.register("name")}
                  placeholder="e.g., Main Trello Board"
                  data-testid="input-integration-name"
                />
              </div>
              
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  {...form.register("apiKey")}
                  type="password"
                  placeholder="Enter your API key"
                  data-testid="input-api-key"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createIntegrationMutation.isPending}
                  data-testid="button-connect"
                >
                  {createIntegrationMutation.isPending ? "Connecting..." : "Connect"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {integrations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-plug text-2xl text-muted-foreground"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">No integrations yet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your project management tools to start generating automated reports.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-integration">
              Add Your First Integration
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {integrations.map((integration: Integration, index: number) => (
            <Card key={integration.id} data-testid={`integration-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${getIntegrationColor(integration.type)} rounded-lg flex items-center justify-center`}>
                      <i className={`${getIntegrationIcon(integration.type)} text-white text-lg`}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold" data-testid={`text-integration-name-${index}`}>
                        {integration.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span data-testid={`text-integration-type-${index}`}>
                          {integration.type.charAt(0).toUpperCase() + integration.type.slice(1)}
                        </span>
                        {integration.lastSync && (
                          <span data-testid={`text-last-sync-${index}`}>
                            Last synced: {new Date(integration.lastSync).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={getStatusColor(integration.status)}
                      data-testid={`badge-integration-status-${index}`}
                    >
                      {integration.status === 'syncing' && (
                        <i className="fas fa-spinner fa-spin w-3 h-3 mr-1"></i>
                      )}
                      {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(integration.id)}
                      disabled={integration.status === 'syncing' || updateIntegrationMutation.isPending}
                      data-testid={`button-sync-${index}`}
                    >
                      <i className="fas fa-sync w-4 h-4 mr-2"></i>
                      Sync Now
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-settings-${index}`}
                    >
                      <i className="fas fa-cog w-4 h-4"></i>
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        {integration.type === 'trello' && 'Boards:'}
                        {integration.type === 'github' && 'Repositories:'}
                        {integration.type === 'asana' && 'Projects:'}
                      </span>
                      <span className="ml-1 font-medium" data-testid={`metric-count-${index}`}>
                        {(integration.config as any)?.boards || 
                         (integration.config as any)?.repositories || 
                         (integration.config as any)?.projects || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tasks Synced:</span>
                      <span className="ml-1 font-medium" data-testid={`metric-tasks-${index}`}>
                        {(integration.config as any)?.tasks || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Import:</span>
                      <span className="ml-1 font-medium" data-testid={`metric-import-${index}`}>
                        {integration.lastSync ? 
                          new Date(integration.lastSync).toLocaleDateString() : 
                          'Never'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`ml-1 font-medium ${
                        integration.status === 'active' ? 'text-green-600' :
                        integration.status === 'syncing' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} data-testid={`status-text-${index}`}>
                        {integration.status === 'active' && 'Connected'}
                        {integration.status === 'syncing' && 'Syncing...'}
                        {integration.status === 'error' && 'Connection Error'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="fab fa-trello text-white text-lg"></i>
              </div>
              <h4 className="font-semibold mb-1">Trello</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Connect Trello boards to track card progress and team velocity.
              </p>
              <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                Connect Trello
              </Button>
            </div>
            
            <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="fab fa-github text-white text-lg"></i>
              </div>
              <h4 className="font-semibold mb-1">GitHub Projects</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Monitor GitHub issues, pull requests, and project milestones.
              </p>
              <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                Connect GitHub
              </Button>
            </div>
            
            <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-tasks text-white text-lg"></i>
              </div>
              <h4 className="font-semibold mb-1">Asana</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Track Asana tasks, projects, and team productivity metrics.
              </p>
              <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                Connect Asana
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
