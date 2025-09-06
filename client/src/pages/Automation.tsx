import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { AutomationRule, UserBehavior } from "@shared/schema";

export default function Automation() {
  const { toast } = useToast();

  const { data: automationRules = [], isLoading } = useQuery<AutomationRule[]>({
    queryKey: ["/api/automation-rules"],
  });

  const { data: userBehaviors = [] } = useQuery<UserBehavior[]>({
    queryKey: ["/api/user-behaviors"],
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/automation-rules/${id}`, data),
    onSuccess: () => {
      toast({ title: "Rule updated", description: "Automation rule updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/automation-rules"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update automation rule.", variant: "destructive" });
    },
  });

  const handleToggleRule = (ruleId: string, isActive: boolean) => {
    updateRuleMutation.mutate({
      id: ruleId,
      data: { isActive }
    });
  };

  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'timing':
        return 'fas fa-clock';
      case 'format':
        return 'fas fa-file-alt';
      case 'priority':
        return 'fas fa-exclamation-triangle';
      case 'metrics':
        return 'fas fa-chart-bar';
      default:
        return 'fas fa-robot';
    }
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'timing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'format':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'priority':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'metrics':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading automation...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Learning Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-brain text-primary"></i>
                Behavioral Learning Engine
              </CardTitle>
              <p className="text-muted-foreground">
                AI system learning from your team's behavior to create intelligent automation rules
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <i className="fas fa-check-circle w-3 h-3 mr-1"></i>
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1" data-testid="text-behaviors-tracked">
                {userBehaviors.length}
              </div>
              <div className="text-sm text-muted-foreground">Behaviors Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1" data-testid="text-rules-learned">
                {automationRules.length}
              </div>
              <div className="text-sm text-muted-foreground">Rules Learned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1" data-testid="text-accuracy">
                {automationRules.length > 0 ? 
                  Math.round(automationRules.reduce((acc, rule) => acc + rule.confidence, 0) / automationRules.length) : 0
                }%
              </div>
              <div className="text-sm text-muted-foreground">Average Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Automation Rules</CardTitle>
          <p className="text-muted-foreground">
            Rules automatically generated based on your team's behavior patterns
          </p>
        </CardHeader>
        <CardContent>
          {automationRules.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-robot text-2xl text-muted-foreground"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">No rules learned yet</h3>
              <p className="text-muted-foreground mb-4">
                The system is learning from your behavior. Automation rules will appear as patterns are detected.
              </p>
              <Badge variant="outline">
                <i className="fas fa-clock w-3 h-3 mr-1"></i>
                Learning in progress...
              </Badge>
            </div>
          ) : (
            <div className="space-y-4">
              {automationRules.map((rule: AutomationRule, index: number) => (
                <div 
                  key={rule.id} 
                  className="p-4 border border-border rounded-lg"
                  data-testid={`automation-rule-${index}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <i className={`${getRuleTypeIcon(rule.type)} text-primary text-sm`}></i>
                        </div>
                        <div>
                          <h4 className="font-semibold" data-testid={`text-rule-title-${index}`}>
                            {rule.title}
                          </h4>
                          <Badge 
                            className={getRuleTypeColor(rule.type)}
                            data-testid={`badge-rule-type-${index}`}
                          >
                            {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3" data-testid={`text-rule-description-${index}`}>
                        {rule.description}
                      </p>
                    </div>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                      disabled={updateRuleMutation.isPending}
                      data-testid={`switch-rule-active-${index}`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Confidence Level</div>
                      <div className="flex items-center gap-2">
                        <Progress value={rule.confidence} className="flex-1" />
                        <span className="text-sm font-medium" data-testid={`text-rule-confidence-${index}`}>
                          {rule.confidence}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Times Applied</div>
                      <div className="text-sm font-medium" data-testid={`text-rule-applications-${index}`}>
                        {rule.applications} times
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Status</div>
                      <Badge 
                        variant={rule.isActive ? "default" : "secondary"}
                        data-testid={`badge-rule-status-${index}`}
                      >
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-3 pt-3 border-t border-border">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-edit-rule-${index}`}
                    >
                      <i className="fas fa-edit w-4 h-4 mr-2"></i>
                      Edit Rule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Learning Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm">Detected preference for Monday morning reports</div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm">Learned PDF format preference for stakeholder reports</div>
                  <div className="text-xs text-muted-foreground">1 day ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm">Identified "urgent" keyword pattern for priority detection</div>
                  <div className="text-xs text-muted-foreground">2 days ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable Behavioral Learning</div>
                  <div className="text-sm text-muted-foreground">
                    Allow the system to learn from user interactions
                  </div>
                </div>
                <Switch defaultChecked data-testid="switch-learning-enabled" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-Apply High Confidence Rules</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically enable rules with 90%+ confidence
                  </div>
                </div>
                <Switch defaultChecked data-testid="switch-auto-apply" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Learning Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified when new patterns are detected
                  </div>
                </div>
                <Switch data-testid="switch-notifications" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
