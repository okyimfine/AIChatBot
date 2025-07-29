import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Settings, FileText, Shield, UserX, Edit, Trash2, Plus, Key, Activity } from "lucide-react";
import type { User, GlobalSetting, AdminLog } from "@shared/schema";

export default function AdminPage() {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingSetting, setEditingSetting] = useState<GlobalSetting | null>(null);
  const [newSetting, setNewSetting] = useState({ key: "", value: "", description: "" });

  // Fetch data
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: settings = [], isLoading: settingsLoading } = useQuery<GlobalSetting[]>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery<AdminLog[]>({
    queryKey: ["/api/admin/logs"],
  });

  const { data: stats } = useQuery<{ totalUsers: number; activeUsers: number; totalMessages: number; }>({
    queryKey: ["/api/admin/stats"],
  });

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: async (user: Partial<User> & { id: string }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${user.id}`, user);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setEditingUser(null);
      toast({ title: "User updated successfully" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "User deleted successfully" });
    },
  });

  const createSettingMutation = useMutation({
    mutationFn: async (setting: typeof newSetting) => {
      const response = await apiRequest("POST", "/api/admin/settings", setting);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setNewSetting({ key: "", value: "", description: "" });
      toast({ title: "Setting created successfully" });
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async (setting: Partial<GlobalSetting> & { id: string }) => {
      const response = await apiRequest("PUT", `/api/admin/settings/${setting.id}`, setting);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setEditingSetting(null);
      toast({ title: "Setting updated successfully" });
    },
  });

  const deleteSettingMutation = useMutation({
    mutationFn: async (settingId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/settings/${settingId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Setting deleted successfully" });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage users, global settings, and monitor system activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.activeUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalMessages || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Global Settings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {settings?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Global Settings
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Activity Logs
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts, permissions, and API keys
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>API Key</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : "No name set"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isAdmin ? "destructive" : "outline"}>
                              {user.isAdmin ? "Admin" : "User"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.geminiApiKey ? "default" : "outline"}>
                              {user.geminiApiKey ? "Set" : "Not Set"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.lastLoginAt
                              ? new Date(user.lastLoginAt).toLocaleDateString()
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingUser(user)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit User</DialogTitle>
                                    <DialogDescription>
                                      Update user information and permissions
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editingUser && (
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                          id="email"
                                          value={editingUser.email || ""}
                                          onChange={(e) =>
                                            setEditingUser({
                                              ...editingUser,
                                              email: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor="firstName">First Name</Label>
                                          <Input
                                            id="firstName"
                                            value={editingUser.firstName || ""}
                                            onChange={(e) =>
                                              setEditingUser({
                                                ...editingUser,
                                                firstName: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="lastName">Last Name</Label>
                                          <Input
                                            id="lastName"
                                            value={editingUser.lastName || ""}
                                            onChange={(e) =>
                                              setEditingUser({
                                                ...editingUser,
                                                lastName: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id="isActive"
                                          checked={editingUser.isActive || false}
                                          onCheckedChange={(checked) =>
                                            setEditingUser({
                                              ...editingUser,
                                              isActive: checked,
                                            })
                                          }
                                        />
                                        <Label htmlFor="isActive">Active User</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id="isAdmin"
                                          checked={editingUser.isAdmin || false}
                                          onCheckedChange={(checked) =>
                                            setEditingUser({
                                              ...editingUser,
                                              isAdmin: checked,
                                            })
                                          }
                                        />
                                        <Label htmlFor="isAdmin">Admin Access</Label>
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button
                                      onClick={() =>
                                        editingUser && updateUserMutation.mutate(editingUser)
                                      }
                                      disabled={updateUserMutation.isPending}
                                    >
                                      {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this user? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUserMutation.mutate(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Global Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Setting</CardTitle>
                  <CardDescription>
                    Add a new global configuration setting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="settingKey">Key</Label>
                      <Input
                        id="settingKey"
                        placeholder="e.g., max_messages_per_day"
                        value={newSetting.key}
                        onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="settingValue">Value</Label>
                      <Input
                        id="settingValue"
                        placeholder="e.g., 100"
                        value={newSetting.value}
                        onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="settingDescription">Description</Label>
                      <Input
                        id="settingDescription"
                        placeholder="Brief description"
                        value={newSetting.description}
                        onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => createSettingMutation.mutate(newSetting)}
                    disabled={createSettingMutation.isPending || !newSetting.key}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {createSettingMutation.isPending ? "Creating..." : "Create Setting"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Global Settings</CardTitle>
                  <CardDescription>
                    Manage application-wide configuration settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {settingsLoading ? (
                    <div className="text-center py-8">Loading settings...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {settings.map((setting) => (
                          <TableRow key={setting.id}>
                            <TableCell className="font-mono">{setting.key}</TableCell>
                            <TableCell className="font-mono">{setting.value}</TableCell>
                            <TableCell>{setting.description}</TableCell>
                            <TableCell>
                              {setting.updatedAt
                                ? new Date(setting.updatedAt).toLocaleDateString()
                                : "Never"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingSetting(setting)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Setting</DialogTitle>
                                      <DialogDescription>
                                        Update the global setting value
                                      </DialogDescription>
                                    </DialogHeader>
                                    {editingSetting && (
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="editKey">Key</Label>
                                          <Input
                                            id="editKey"
                                            value={editingSetting.key || ""}
                                            onChange={(e) =>
                                              setEditingSetting({
                                                ...editingSetting,
                                                key: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="editValue">Value</Label>
                                          <Textarea
                                            id="editValue"
                                            value={editingSetting.value || ""}
                                            onChange={(e) =>
                                              setEditingSetting({
                                                ...editingSetting,
                                                value: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="editDescription">Description</Label>
                                          <Input
                                            id="editDescription"
                                            value={editingSetting.description || ""}
                                            onChange={(e) =>
                                              setEditingSetting({
                                                ...editingSetting,
                                                description: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                      </div>
                                    )}
                                    <DialogFooter>
                                      <Button
                                        onClick={() =>
                                          editingSetting && updateSettingMutation.mutate(editingSetting)
                                        }
                                        disabled={updateSettingMutation.isPending}
                                      >
                                        {updateSettingMutation.isPending ? "Saving..." : "Save Changes"}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Setting</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this setting? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteSettingMutation.mutate(setting.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>
                  Monitor admin actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="text-center py-8">Loading logs...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {log.createdAt
                              ? new Date(log.createdAt).toLocaleString()
                              : "Unknown"}
                          </TableCell>
                          <TableCell>{log.adminId}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.target || "N/A"}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {log.details || "No details"}
                          </TableCell>
                          <TableCell>{log.ipAddress || "Unknown"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}